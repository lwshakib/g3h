import { Response } from "express";
import { s3Service } from "../services/s3.services.js";
import { postgresService } from "../services/postgres.services.js";
import logger from "../logger/winston.logger.js";

export const getUploadUrl = async (req: any, res: Response) => {
  const { contentType, extension } = req.body;
  const userId = req.user.id;

  if (!contentType || !extension) {
    return res.status(400).json({ success: false, message: "Invalid payload: contentType and extension required." });
  }

  try {
    const path = `avatars/${userId}/${Date.now()}.${extension}`;
    const uploadUrl = await s3Service.getPresignedUploadUrl(path, contentType);

    res.json({
      success: true,
      uploadUrl,
      path,
    });
  } catch (error: any) {
    logger.error(`[UserController] Presigned URL generation failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to generate upload credentials." });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, image } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await postgresService.updateUser(userId, { name, image });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Node Identity not found." });
    }

    res.json({
      success: true,
      message: "Sync_Identity_Protocol_Complete",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch (error: any) {
    logger.error(`[UserController] Profile update failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Sync_Identity_Protocol_Error" });
  }
};
