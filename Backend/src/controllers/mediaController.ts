import { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import * as mediaService from '../services/mediaService';
import { AuthRequest } from '../middleware/authMiddleware';

// Handles new media uploads
export const uploadMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mediaAsset = await mediaService.createMediaAsset(req);
    res.status(201).json(mediaAsset);
  } catch (e) {
    next(e);
  }
};

// Gets all media assets for the logged-in user
export const getAllMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id; // Assumes protect middleware attaches user to the request
    const mediaAssets = await mediaService.getAllMediaForUser(userId);
    res.json(mediaAssets);
  } catch (e) {
    next(e);
  }
};

// Generates a secure, temporary URL for streaming a specific media asset
export const getMediaStreamUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Media ID is required.' });
    }
    const ipAddress = req.ip || 'unknown';
    const secureUrl = await mediaService.generateSecureUrl(id, ipAddress);
    res.json({ secureUrl });
  } catch (e) {
    next(e);
  }
};

// Deletes a specific media asset
export const deleteMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await mediaService.deleteMediaAsset(id, userId);
    res.status(204).send(); // Send 204 No Content for a successful deletion
  } catch (e) {
    next(e);
  }
};
export const streamMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { mediaId: string };
    
    const media = await mediaService.getMediaById(decoded.mediaId);
    if (!media) {
      return res.status(404).send('Media not found or link expired');
    }
    const projectRoot = path.resolve(__dirname, '../../');
    const filePath = path.join(projectRoot, media.file_url);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Failed to send file:", err);
        next(err);
      }
    });

  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).send('Invalid or expired token.');
  }
};