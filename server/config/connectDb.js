import mongoose from "mongoose";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const buildFallbackMongoUri = async (srvUri) => {
  const parsedUrl = new URL(srvUri);
  const clusterHost = parsedUrl.hostname;
  const lookupTarget = `_mongodb._tcp.${clusterHost}`;
  const { stdout } = await execFileAsync("nslookup", ["-type=SRV", lookupTarget], {
    windowsHide: true,
  });

  const hosts = [...stdout.matchAll(/svr hostname\s*=\s*([^\s]+)/gi)].map((match) => match[1].trim());
  if (!hosts.length) {
    throw new Error(`Unable to resolve MongoDB hosts for ${lookupTarget}`);
  }

  const credentials = parsedUrl.username
    ? `${parsedUrl.username}${parsedUrl.password ? `:${parsedUrl.password}` : ""}@`
    : "";
  const searchParams = new URLSearchParams(parsedUrl.search);
  const queryParts = [];

  for (const [key, value] of searchParams.entries()) {
    if (key !== "srvServiceName") {
      queryParts.push(`${key}=${value}`);
    }
  }

  if (!searchParams.has("tls") && !searchParams.has("ssl")) {
    queryParts.push("tls=true");
  }
  if (!searchParams.has("authSource")) {
    queryParts.push("authSource=admin");
  }

  const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
  return `mongodb://${credentials}${hosts.join(",")}${parsedUrl.pathname}${queryString}`;
};

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing")
    }
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000,
    })
    console.log("DataBase Connected")
  } catch (error) {
    if (
      process.env.MONGODB_URL?.startsWith("mongodb+srv://") &&
      /querySrv/i.test(error.message || "")
    ) {
      try {
        const fallbackUri = await buildFallbackMongoUri(process.env.MONGODB_URL);
        await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 30000,
        });
        console.log("DataBase Connected");
        return;
      } catch (fallbackError) {
        console.log(`DataBase Error: ${fallbackError.message}`)
        throw fallbackError
      }
    }
    console.log(`DataBase Error: ${error.message}`)
    throw error
  }
}

export default connectDb
