import compression from "compression";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
// map bundle source links to original source
import "source-map-support/register";

const app = express();

app.get("/", (req, res) => {
    res.json({message: "hello world!"});
});
