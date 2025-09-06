import { prisma } from '../db/prisma';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

// Creates a new media asset record in the database
export const createMediaAsset = async (req: AuthRequest) => {
  if (!req.file) {
    throw new Error('Media file is required.');
  }
  const { title, type } = req.body;
  if (!title || !type) {
    throw new Error('Title and type are required fields.');
  }
  const userId = req.user!.id;

  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      title,
      type,
      file_url: req.file.path,
      uploadedById: userId,
    },
  });

  return mediaAsset;
};

// --- ADD THIS FUNCTION ---
// Retrieves all media assets for a specific user
export const getAllMediaForUser = async (userId: string) => {
  return await prisma.mediaAsset.findMany({
    where: {
      uploadedById: userId,
    },
    orderBy: {
      created_at: 'desc', // Show the newest media first
    },
  });
};
// -------------------------

// --- ADD THIS FUNCTION ---
// Deletes a media asset, ensuring the user owns it
export const deleteMediaAsset = async (mediaId: string, userId: string) => {
  // The 'where' clause ensures a user can only delete their own media
  const result = await prisma.mediaAsset.deleteMany({
    where: {
      id: mediaId,
      uploadedById: userId,
    },
  });

  if (result.count === 0) {
    // This means either the media didn't exist or the user didn't have permission
    throw { status: 404, message: 'Media not found or you do not have permission to delete it.' };
  }

  return result;
};
// -------------------------

// Generates a secure, temporary URL for streaming
export const generateSecureUrl = async (mediaId: string, ip: string) => {
  const media = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
  if (!media) {
    throw { status: 404, message: 'Media not found' };
  }

  await prisma.mediaViewLog.create({
    data: {
      media_id: mediaId,
      viewed_by_ip: ip,
    },
  });

  const streamToken = jwt.sign({ mediaId: media.id }, process.env.JWT_SECRET!, {
    expiresIn: '10m', // The link will be valid for 10 minutes
  });
  
  // Construct the full URL for the client
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
  return `${baseUrl}/api/media/stream/${streamToken}`;
};

// Retrieves a single media asset by its ID
export const getMediaById = async (id: string) => {
  return await prisma.mediaAsset.findUnique({ where: { id } });
};
