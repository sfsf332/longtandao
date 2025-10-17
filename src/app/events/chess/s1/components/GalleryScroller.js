'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function GalleryScroller() {
  const galleryGridRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const autoScrollIntervalRef = useRef(null);
  const userInteractionTimeoutRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const momentumRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isInfiniteLoopRef = useRef(true);
  const totalWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const seamlessOffsetRef = useRef(0);
  const isThrottledRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);

  useEffect(() => {
    const galleryGrid = galleryGridRef.current;
    const container = containerRef.current;
    
    if (!galleryGrid || !container) return;

    const calculateDimensions = () => {
      containerWidthRef.current = container.offsetWidth;
      totalWidthRef.current = galleryGrid.scrollWidth;
      seamlessOffsetRef.current = totalWidthRef.current;
    };

    const getCurrentTransform = () => {
      const transform = galleryGrid.style.transform;
      const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const setTransform = useCallback((value, smooth = false) => {
      // 节流处理，避免过于频繁的更新
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 16) { // 60fps
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          setTransform(value, smooth);
        });
        return;
      }
      lastUpdateTimeRef.current = now;

      calculateDimensions();
      
      const maxScroll = -(totalWidthRef.current - containerWidthRef.current);
      
      if (isInfiniteLoopRef.current && !isTransitioningRef.current) {
        if (value > 0) {
          value = maxScroll + (value % totalWidthRef.current);
        } else if (value < maxScroll) {
          const overflow = Math.abs(value - maxScroll);
          value = -(overflow % totalWidthRef.current);
        }
      } else if (!isTransitioningRef.current) {
        value = Math.max(maxScroll, Math.min(0, value));
      }
      
      // 添加平滑过渡
      if (smooth) {
        galleryGrid.style.transition = 'transform 0.8s ease-in-out';
        isTransitioningRef.current = true;
        setTimeout(() => {
          galleryGrid.style.transition = '';
          isTransitioningRef.current = false;
        }, 800);
      }
      
      // 使用 transform3d 启用硬件加速，添加 will-change 优化
      galleryGrid.style.willChange = 'transform';
      galleryGrid.style.transform = `translate3d(${Math.round(value * 100) / 100}px, 0, 0)`;
    }, []);

    const startAutoScroll = () => {
      let currentIndex = 0;
      const itemWidth = 380 + 30; // 图片宽度 + 间距
      
      const switchToNext = () => {
        if (!isDraggingRef.current && !isTransitioningRef.current) {
          currentIndex++;
          const targetTransform = -currentIndex * itemWidth;
          setTransform(targetTransform, true); // 使用平滑过渡
          
          // 如果到达最后一张，重置到第一张
          if (currentIndex >= galleryGrid.children.length) {
            setTimeout(() => {
              currentIndex = 0;
              setTransform(0, true); // 平滑重置到第一张
            }, 1000); // 1秒后重置
          }
        }
      };
      
      // 每3秒切换一张
      autoScrollIntervalRef.current = setInterval(switchToNext, 3000);
    };

    const stopAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };

    const startMomentumScroll = () => {
      if (Math.abs(momentumRef.current) < 0.1) {
        return;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      const animate = () => {
        if (Math.abs(momentumRef.current) < 0.05) {
          momentumRef.current = 0;
          return;
        }
        
        const currentTransform = getCurrentTransform();
        setTransform(currentTransform + momentumRef.current * 15); // 减少动量强度
        
        momentumRef.current *= 0.88; // 增加阻尼，更快停止
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };

    const scheduleAutoScroll = () => {
      userInteractionTimeoutRef.current = setTimeout(() => {
        if (!isTransitioningRef.current) {
          startAutoScroll();
        }
      }, 3000);
    };

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.pageX - galleryGrid.offsetLeft;
      scrollLeftRef.current = getCurrentTransform();
      galleryGrid.style.cursor = 'grabbing';
      galleryGrid.style.transition = '';
      isTransitioningRef.current = false;
      momentumRef.current = 0;
      lastMoveTimeRef.current = Date.now();
      lastMoveXRef.current = e.pageX;
      stopAutoScroll();
    };

    const handleMouseMove = useCallback((e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      
      // 节流处理
      if (isThrottledRef.current) return;
      isThrottledRef.current = true;
      
      requestAnimationFrame(() => {
        isThrottledRef.current = false;
        
        const currentTime = Date.now();
        const currentX = e.pageX - galleryGrid.offsetLeft;
        const walk = (currentX - startXRef.current) * 1.8;
        
        if (currentTime - lastMoveTimeRef.current > 0) {
          momentumRef.current = (e.pageX - lastMoveXRef.current) / (currentTime - lastMoveTimeRef.current);
        }
        
        lastMoveTimeRef.current = currentTime;
        lastMoveXRef.current = e.pageX;
        
        setTransform(scrollLeftRef.current + walk);
      });
    }, [setTransform]);

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      galleryGrid.style.cursor = 'grab';
      
      startMomentumScroll();
      scheduleAutoScroll();
    };

    const handleTouchStart = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].pageX;
      scrollLeftRef.current = getCurrentTransform();
      galleryGrid.style.transition = '';
      isTransitioningRef.current = false;
      momentumRef.current = 0;
      lastMoveTimeRef.current = Date.now();
      lastMoveXRef.current = e.touches[0].pageX;
      stopAutoScroll();
    };

    const handleTouchMove = useCallback((e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      
      // 节流处理
      if (isThrottledRef.current) return;
      isThrottledRef.current = true;
      
      requestAnimationFrame(() => {
        isThrottledRef.current = false;
        
        const currentTime = Date.now();
        const currentX = e.touches[0].pageX;
        const walk = (currentX - startXRef.current) * 1.6;
        
        if (currentTime - lastMoveTimeRef.current > 0) {
          momentumRef.current = (currentX - lastMoveXRef.current) / (currentTime - lastMoveTimeRef.current);
        }
        
        lastMoveTimeRef.current = currentTime;
        lastMoveXRef.current = currentX;
        
        setTransform(scrollLeftRef.current + walk);
      });
    }, [setTransform]);

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      
      startMomentumScroll();
      scheduleAutoScroll();
    };

    // 初始化
    calculateDimensions();
    
    // 添加事件监听器，优化移动端性能
    galleryGrid.addEventListener('mousedown', handleMouseDown);
    galleryGrid.addEventListener('mousemove', handleMouseMove, { passive: false });
    galleryGrid.addEventListener('mouseup', handleMouseUp);
    galleryGrid.addEventListener('mouseleave', handleMouseUp);
    galleryGrid.addEventListener('touchstart', handleTouchStart, { passive: false });
    galleryGrid.addEventListener('touchmove', handleTouchMove, { passive: false });
    galleryGrid.addEventListener('touchend', handleTouchEnd, { passive: true });
    galleryGrid.addEventListener('dragstart', (e) => e.preventDefault());
    
    // 添加触摸优化
    galleryGrid.style.touchAction = 'pan-y';
    galleryGrid.style.userSelect = 'none';
    galleryGrid.style.webkitUserSelect = 'none';

    // 启动自动滚动
    startAutoScroll();

    // 清理函数
    return () => {
      galleryGrid.removeEventListener('mousedown', handleMouseDown);
      galleryGrid.removeEventListener('mousemove', handleMouseMove);
      galleryGrid.removeEventListener('mouseup', handleMouseUp);
      galleryGrid.removeEventListener('mouseleave', handleMouseUp);
      galleryGrid.removeEventListener('touchstart', handleTouchStart);
      galleryGrid.removeEventListener('touchmove', handleTouchMove);
      galleryGrid.removeEventListener('touchend', handleTouchEnd);
      galleryGrid.removeEventListener('dragstart', (e) => e.preventDefault());
      
      stopAutoScroll();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="gallery-container">
      <div ref={galleryGridRef} className="gallery-grid" id="galleryGrid">
        {/* 内容将通过父组件传递 */}
      </div>
    </div>
  );
}
