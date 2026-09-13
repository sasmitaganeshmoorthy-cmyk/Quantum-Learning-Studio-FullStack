import { Router } from 'express';

const videosRouter = Router();

const videos = [
  // ---------------- INTERMEDIATE ----------------
  {
    id: 'intermediate-1',
    title: 'Intermediate Video 1',
    level: 'intermediate',
    description: 'Intermediate quantum computing lesson.',
    videoUrl: '/videos/intermediate/video-1.mp4',
    order: 1
  },
  {
    id: 'intermediate-2',
    title: 'Intermediate Video 2',
    level: 'intermediate',
    description: 'Intermediate quantum computing lesson.',
    videoUrl: '/videos/intermediate/video-2.mp4',
    order: 2
  },
  {
    id: 'intermediate-3',
    title: 'Intermediate Video 3',
    level: 'intermediate',
    description: 'Intermediate quantum computing lesson.',
    videoUrl: '/videos/intermediate/video-3.mp4',
    order: 3
  },

  // ---------------- ADVANCED ----------------
  {
    id: 'advanced-1',
    title: 'Advanced Video 1',
    level: 'advanced',
    description: 'Advanced quantum computing lesson.',
    videoUrl: '/videos/advanced/video-1.mp4',
    order: 1
  },
  {
    id: 'advanced-2',
    title: 'Advanced Video 2',
    level: 'advanced',
    description: 'Advanced quantum computing lesson.',
    videoUrl: '/videos/advanced/video-2.mp4',
    order: 2
  },
  {
    id: 'advanced-3',
    title: 'Advanced Video 3',
    level: 'advanced',
    description: 'Advanced quantum computing lesson.',
    videoUrl: '/videos/advanced/video-3.mp4',
    order: 3
  }
];

// Get all videos
videosRouter.get('/', (_request, response) => {
  response.json({ videos });
});

// Get videos by level
videosRouter.get('/:level', (request, response) => {
  const level = request.params.level.toLowerCase();

  if (level !== 'intermediate' && level !== 'advanced') {
    return response.status(400).json({
      error: 'Invalid level. Use intermediate or advanced.'
    });
  }

  const filteredVideos = videos.filter(
    (video) => video.level === level
  );

  return response.json({
    level,
    videos: filteredVideos
  });
});

export { videosRouter };