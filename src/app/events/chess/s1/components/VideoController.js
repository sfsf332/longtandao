'use client';

import { useEffect, useRef } from 'react';

export default function VideoController() {
  const videosRef = useRef([]);

  useEffect(() => {
    // 延迟执行，确保 DOM 完全加载
    const timer = setTimeout(() => {
      const videoItems = document.querySelectorAll('[class*="videoItem"]');
      console.log('Found video items:', videoItems.length);
      
      videoItems.forEach((item, index) => {
        const video = item.querySelector('video');
        const overlay = item.querySelector('[class*="videoOverlay"]');
        const playButton = item.querySelector('[class*="playButton"]');
        
        console.log(`Video ${index + 1}:`, { video: !!video, overlay: !!overlay, playButton: !!playButton });
        
        if (video && overlay && playButton) {
          const videoData = {
            element: video,
            overlay: overlay,
            playButton: playButton,
            container: item,
            isPlaying: false,
            index: index
          };
          
          videosRef.current.push(videoData);
          setupVideoEvents(videoData);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const setupVideoEvents = (videoData) => {
    const { element, overlay, playButton, container } = videoData;
    
    // 点击播放按钮或视频覆盖层
    overlay.addEventListener('click', () => {
      toggleVideo(videoData);
    });
    
    // 视频播放事件
    element.addEventListener('play', () => {
      onVideoPlay(videoData);
    });
    
    // 视频暂停事件
    element.addEventListener('pause', () => {
      onVideoPause(videoData);
    });
    
    // 视频结束事件
    element.addEventListener('ended', () => {
      onVideoEnded(videoData);
    });
    
    // 视频加载错误事件
    element.addEventListener('error', () => {
      onVideoError(videoData);
    });
    
    // 视频点击事件（播放时点击暂停）
    element.addEventListener('click', () => {
      if (videoData.isPlaying) {
        pauseVideo(videoData);
      }
    });
  };

  const toggleVideo = (videoData) => {
    if (videoData.isPlaying) {
      pauseVideo(videoData);
    } else {
      playVideo(videoData);
    }
  };

  const playVideo = (videoData) => {
    // 暂停其他正在播放的视频
    pauseAllOtherVideos(videoData.index);
    
    const { element } = videoData;
    
    // 尝试播放视频
    const playPromise = element.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log(`视频 ${videoData.index + 1} 开始播放`);
      }).catch(error => {
        console.error(`视频 ${videoData.index + 1} 播放失败:`, error);
        onVideoError(videoData);
      });
    }
  };

  const pauseVideo = (videoData) => {
    const { element } = videoData;
    element.pause();
  };

  const pauseAllOtherVideos = (currentIndex) => {
    videosRef.current.forEach((videoData, index) => {
      if (index !== currentIndex && videoData.isPlaying) {
        pauseVideo(videoData);
      }
    });
  };

  const onVideoPlay = (videoData) => {
    const { overlay, container } = videoData;
    
    videoData.isPlaying = true;
    overlay.classList.add('playing');
    container.classList.add('playing');
    
    // 更新播放按钮为暂停图标
    updatePlayButton(videoData, 'pause');
  };

  const onVideoPause = (videoData) => {
    const { overlay, container } = videoData;
    
    videoData.isPlaying = false;
    overlay.classList.remove('playing');
    container.classList.remove('playing');
    
    // 更新播放按钮为播放图标
    updatePlayButton(videoData, 'play');
  };

  const onVideoEnded = (videoData) => {
    const { element } = videoData;
    
    // 重置视频到开始位置
    element.currentTime = 0;
    onVideoPause(videoData);
  };

  const onVideoError = (videoData) => {
    console.error(`视频 ${videoData.index + 1} 加载失败`);
    
    // 显示错误提示
    const { container } = videoData;
    const errorMsg = container.querySelector('.video-error') || document.createElement('div');
    errorMsg.className = 'video-error';
    errorMsg.textContent = '视频加载失败，请稍后重试';
    errorMsg.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      background: rgba(0,0,0,0.7);
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 14px;
    `;
    
    if (!container.querySelector('.video-error')) {
      container.querySelector('[class*="videoContainer"]').appendChild(errorMsg);
    }
  };

  const updatePlayButton = (videoData, state) => {
    const { playButton } = videoData;
    const svg = playButton.querySelector('svg');
    
    if (state === 'pause') {
      // 暂停图标 - 几乎透明
      svg.innerHTML = `
        <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.01)"/>
        <rect x="22" y="18" width="6" height="24" fill="rgba(255,255,255,0.1)"/>
        <rect x="32" y="18" width="6" height="24" fill="rgba(255,255,255,0.1)"/>
      `;
    } else {
      // 播放图标 - 降低透明度
      svg.innerHTML = `
        <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.3)"/>
        <path d="M23 18L23 42L42 30L23 18Z" fill="#2193b0"/>
      `;
    }
  };

  return null; // 这个组件不渲染任何内容，只提供功能
}
