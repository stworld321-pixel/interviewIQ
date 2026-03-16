import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { speakText } from "../controllers/tts.controller.js";

const ttsRouter = express.Router();

ttsRouter.post("/speak", isAuth, speakText);

export default ttsRouter;

