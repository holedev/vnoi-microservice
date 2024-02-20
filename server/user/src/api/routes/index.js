import { Router } from "express";
import { UnauthorizeError } from "../../../../common/src/response/errors/UnauthorizeError.js";

const router = Router();

router.get("/", (req, res) => {
  throw new UnauthorizeError("Fail!");
});

export default router;
