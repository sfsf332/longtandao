'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../page.module.css';

export default function GallerySection() {
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

    const setTransform = (value) => {
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
      
      galleryGrid.style.transform = `translateX(${value}px)`;
    };

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isDraggingRef.current && !isTransitioningRef.current) {
          const currentTransform = getCurrentTransform();
          setTransform(currentTransform - 2);
        }
      }, 50);
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
        setTransform(currentTransform + momentumRef.current * 20);
        
        momentumRef.current *= 0.92;
        
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

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      
      const currentTime = Date.now();
      const currentX = e.pageX - galleryGrid.offsetLeft;
      const walk = (currentX - startXRef.current) * 1.8;
      
      if (currentTime - lastMoveTimeRef.current > 0) {
        momentumRef.current = (e.pageX - lastMoveXRef.current) / (currentTime - lastMoveTimeRef.current);
      }
      
      lastMoveTimeRef.current = currentTime;
      lastMoveXRef.current = e.pageX;
      
      setTransform(scrollLeftRef.current + walk);
    };

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

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      
      const currentTime = Date.now();
      const currentX = e.touches[0].pageX;
      const walk = (currentX - startXRef.current) * 1.6;
      
      if (currentTime - lastMoveTimeRef.current > 0) {
        momentumRef.current = (currentX - lastMoveXRef.current) / (currentTime - lastMoveTimeRef.current);
      }
      
      lastMoveTimeRef.current = currentTime;
      lastMoveXRef.current = currentX;
      
      setTransform(scrollLeftRef.current + walk);
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      
      startMomentumScroll();
      scheduleAutoScroll();
    };

    // 初始化
    calculateDimensions();
    
    // 添加事件监听器
    galleryGrid.addEventListener('mousedown', handleMouseDown);
    galleryGrid.addEventListener('mousemove', handleMouseMove);
    galleryGrid.addEventListener('mouseup', handleMouseUp);
    galleryGrid.addEventListener('mouseleave', handleMouseUp);
    galleryGrid.addEventListener('touchstart', handleTouchStart, { passive: false });
    galleryGrid.addEventListener('touchmove', handleTouchMove, { passive: false });
    galleryGrid.addEventListener('touchend', handleTouchEnd);
    galleryGrid.addEventListener('dragstart', (e) => e.preventDefault());

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
    <section className={`${styles.section} ${styles.gallery}`}>
      <h2 className={styles.sectionTitle}>大赛风采<div className={styles.sectionTitleUnderline}></div></h2>
      <div ref={containerRef} className={styles.galleryContainer}>
        <div ref={galleryGridRef} className={styles.galleryGrid} id="galleryGrid">
          {/* 对弈照片 */}
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi0.jpg" alt="对弈现场1" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>激烈的对弈现场</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi1.jpg" alt="对弈现场2" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>选手专注思考</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi2.jpg" alt="对弈现场3" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>棋局精彩对决</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi3.jpg" alt="对弈现场4" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>高手过招瞬间</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi4.jpg" alt="对弈现场5" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>深度思考时刻</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi5.jpg" alt="对弈现场6" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>棋手风采展示</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi6.jpg" alt="对弈现场7" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>紧张对弈氛围</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi7.jpg" alt="对弈现场8" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>智慧的较量</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi8.jpg" alt="对弈现场9" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>精彩对局收官</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/duiyi9.jpg" alt="对弈现场9" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>精彩瞬间记录</div>
          </div>
          {/* 领奖照片 */}
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/lingjiang1.jpg" alt="颁奖典礼" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>来打酱油也光荣</div>
          </div>
          {/* 围观照片 */}
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan0.jpg" alt="观众围观1" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>观众热情围观</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan1.jpg" alt="观众围观2" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>现场气氛热烈</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan2.jpg" alt="观众围观3" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>观众专注观赛</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan3.jpg" alt="观众围观4" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>围观群众助威</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan4.jpg" alt="观众围观5" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>观赛人群聚集</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan5.jpg" alt="观众围观6" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>现场观众互动</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan6.jpg" alt="观众围观7" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>观众津津有味</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan7.jpg" alt="观众围观8" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>围观学习交流</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/weiguan8.jpg" alt="观众围观9" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>棋手专注对弈</div>
          </div>
          {/* 现场照片 */}
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/xianchang1.jpg" alt="比赛现场1" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>比赛现场全景</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/xianchang2.jpg" alt="比赛现场2" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>赛事组织有序</div>
          </div>
          <div className={styles.galleryItem}>
            <div className={styles.galleryImage}>
              <Image src="/Photo/xianchang3.jpg" alt="比赛现场3" width={380} height={280} />
            </div>
            <div className={styles.galleryCaption}>现场布置整齐</div>
          </div>
        </div>
      </div>
    </section>
  );
}
