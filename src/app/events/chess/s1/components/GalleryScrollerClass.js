'use client';

import { useEffect } from 'react';

/**
 * 大赛风采照片展示交互功能
 * 实现拖动滚动和自动滚动效果
 * 优化版本：提供更流畅的滚动体验和真正的单向无缝循环效果
 */
class GalleryScroller {
    constructor() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.container = this.galleryGrid.parentElement;
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.autoScrollInterval = null;
        this.autoScrollSpeed = 2; // 优化自动滚动速度
        this.userInteractionTimeout = null;
        this.isTransitioning = false; // 过渡状态标记
        this.momentum = 0; // 动量滚动
        this.lastMoveTime = 0; // 记录最后移动时间
        this.lastMoveX = 0; // 记录最后移动位置
        this.animationFrame = null; // 动画帧ID
        this.isInfiniteLoop = true; // 启用无限循环模式
        this.totalWidth = 0; // 总宽度
        this.containerWidth = 0; // 容器宽度
        this.seamlessOffset = 0; // 无缝循环偏移量
        this.isThrottled = false; // 节流标记
        this.lastUpdateTime = 0; // 最后更新时间
        this.isMobile = this.detectMobile(); // 检测是否为移动端
        this.itemWidth = 380 + 30; // 图片宽度 + 间距
        
        this.init();
    }

    /**
     * 检测是否为移动端
     */
    detectMobile() {
        // 多种方式检测移动端
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isMobileWidth = window.innerWidth <= 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        const isMobile = isMobileUA || isMobileWidth || isTouchDevice;
        
        console.log('移动端检测:', {
            userAgent: isMobileUA,
            width: isMobileWidth,
            touch: isTouchDevice,
            final: isMobile,
            windowWidth: window.innerWidth
        });
        
        return isMobile;
    }

    /**
     * 初始化事件监听器
     */
    init() {
        // 计算尺寸
        this.calculateDimensions();
        
        // 添加移动端优化样式
        this.galleryGrid.style.touchAction = 'pan-y';
        this.galleryGrid.style.userSelect = 'none';
        this.galleryGrid.style.webkitUserSelect = 'none';
        this.galleryGrid.style.willChange = 'transform';
        this.galleryGrid.style.transform = 'translate3d(0, 0, 0)';
        this.galleryGrid.style.backfaceVisibility = 'hidden';
        this.galleryGrid.style.perspective = '1000px';
        
        // 鼠标事件
        this.galleryGrid.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.galleryGrid.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: false });
        this.galleryGrid.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.galleryGrid.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // 触摸事件
        this.galleryGrid.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.galleryGrid.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.galleryGrid.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // 防止图片拖拽
        this.galleryGrid.addEventListener('dragstart', (e) => e.preventDefault());

        // 添加图片点击事件
        this.addImageClickEvents();

        // 启动自动滚动（仅桌面端）
        if (!this.isMobile) {
            this.startAutoScroll();
        } else {
            // 移动端强制停止任何可能的自动滚动
            this.forceStopAutoScroll();
        }
    }

    /**
     * 添加图片点击事件
     */
    addImageClickEvents() {
        const galleryItems = this.galleryGrid.querySelectorAll('[class*="galleryItem"]');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                // 阻止事件冒泡
                e.stopPropagation();
                
                // 将点击的图片移动到第一位
                this.moveItemToFirst(index);
            });
        });
    }

    /**
     * 将指定索引的图片移动到第一位
     */
    moveItemToFirst(targetIndex) {
        if (targetIndex === 0) return; // 已经在第一位
        
        // 计算目标位置
        const targetTransform = -targetIndex * this.itemWidth;
        
        // 添加平滑过渡
        this.galleryGrid.style.transition = 'transform 0.6s ease-in-out';
        this.isTransitioning = true;
        
        // 移动到目标位置
        this.setTransform(targetTransform);
        
        // 过渡完成后，重新排列DOM元素
        setTimeout(() => {
            const items = Array.from(this.galleryGrid.children);
            const targetItem = items[targetIndex];
            
            // 将目标元素移动到第一位
            this.galleryGrid.insertBefore(targetItem, this.galleryGrid.firstChild);
            
            // 重置位置到0
            this.setTransform(0);
            
            // 清理过渡效果
            setTimeout(() => {
                this.galleryGrid.style.transition = '';
                this.isTransitioning = false;
                
                // 重新绑定点击事件
                this.addImageClickEvents();
            }, 50);
        }, 600);
    }

    /**
     * 计算容器和内容尺寸
     */
    calculateDimensions() {
        this.containerWidth = this.container.offsetWidth;
        this.totalWidth = this.galleryGrid.scrollWidth;
        this.seamlessOffset = this.totalWidth; // 设置无缝循环偏移量
    }

    /**
     * 鼠标按下事件处理
     */
    handleMouseDown(e) {
        this.isDragging = true;
        this.startX = e.pageX - this.galleryGrid.offsetLeft;
        this.scrollLeft = this.getCurrentTransform();
        this.galleryGrid.style.cursor = 'grabbing';
        // 清除任何过渡效果和动画
        this.galleryGrid.style.transition = '';
        this.isTransitioning = false;
        this.momentum = 0;
        this.lastMoveTime = Date.now();
        this.lastMoveX = e.pageX;
        this.stopAutoScroll();
        this.cancelMomentumAnimation();
    }

    /**
     * 鼠标移动事件处理
     */
    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        // 节流处理
        if (this.isThrottled) return;
        this.isThrottled = true;
        
        requestAnimationFrame(() => {
            this.isThrottled = false;
            
            const currentTime = Date.now();
            const currentX = e.pageX - this.galleryGrid.offsetLeft;
            const walk = (currentX - this.startX) * 1.8; // 优化滚动敏感度
            
            // 计算动量
            if (currentTime - this.lastMoveTime > 0) {
                this.momentum = (e.pageX - this.lastMoveX) / (currentTime - this.lastMoveTime);
            }
            
            this.lastMoveTime = currentTime;
            this.lastMoveX = e.pageX;
            
            this.setTransform(this.scrollLeft + walk);
        });
    }

    /**
     * 鼠标释放事件处理
     */
    handleMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.galleryGrid.style.cursor = 'grab';
        
        // 启动动量滚动
        this.startMomentumScroll();
        
        // 仅桌面端启动自动滚动
        if (!this.isMobile) {
            this.scheduleAutoScroll();
        }
    }

    /**
     * 触摸开始事件处理
     */
    handleTouchStart(e) {
        this.isDragging = true;
        this.startX = e.touches[0].pageX;
        this.scrollLeft = this.getCurrentTransform();
        // 清除任何过渡效果和动画
        this.galleryGrid.style.transition = '';
        this.isTransitioning = false;
        this.momentum = 0;
        this.lastMoveTime = Date.now();
        this.lastMoveX = e.touches[0].pageX;
        this.stopAutoScroll();
        this.cancelMomentumAnimation();
    }

    /**
     * 触摸移动事件处理
     */
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        // 节流处理
        if (this.isThrottled) return;
        this.isThrottled = true;
        
        requestAnimationFrame(() => {
            this.isThrottled = false;
            
            const currentTime = Date.now();
            const currentX = e.touches[0].pageX;
            const walk = (currentX - this.startX) * 1.6; // 优化触摸滚动敏感度
            
            // 计算动量
            if (currentTime - this.lastMoveTime > 0) {
                this.momentum = (currentX - this.lastMoveX) / (currentTime - this.lastMoveTime);
            }
            
            this.lastMoveTime = currentTime;
            this.lastMoveX = currentX;
            
            this.setTransform(this.scrollLeft + walk);
        });
    }

    /**
     * 触摸结束事件处理
     */
    handleTouchEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        // 启动动量滚动
        this.startMomentumScroll();
        
        // 仅桌面端启动自动滚动
        if (!this.isMobile) {
            this.scheduleAutoScroll();
        }
    }

    /**
     * 获取当前transform值
     */
    getCurrentTransform() {
        const transform = this.galleryGrid.style.transform;
        const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        return match ? parseFloat(match[1]) : 0;
    }

    /**
     * 设置transform值 - 实现真正的无缝循环
     */
    setTransform(value) {
        // 更新尺寸（防止窗口大小变化）
        this.calculateDimensions();
        
        const maxScroll = -(this.totalWidth - this.containerWidth);
        
        if (this.isInfiniteLoop && !this.isTransitioning) {
            // 实现真正的无缝循环：当滚动到边界时，无缝跳转到另一端
            if (value > 0) {
                // 向右滚动超出边界，无缝跳转到左端
                value = maxScroll + (value % this.totalWidth);
            } else if (value < maxScroll) {
                // 向左滚动超出边界，无缝跳转到右端
                const overflow = Math.abs(value - maxScroll);
                value = -(overflow % this.totalWidth);
            }
        } else if (!this.isTransitioning) {
            // 普通模式：严格限制边界
            value = Math.max(maxScroll, Math.min(0, value));
        }
        
        // 使用 transform3d 启用硬件加速，减少抖动
        this.galleryGrid.style.willChange = 'transform';
        this.galleryGrid.style.transform = `translate3d(${Math.round(value * 100) / 100}px, 0, 0)`;
    }

    /**
     * 启动自动滚动 - 实现单向连续滚动
     */
    startAutoScroll() {
        // 双重检查移动端，确保不会在移动端自动滚动
        if (this.isMobile || window.innerWidth <= 768 || 'ontouchstart' in window) {
            console.log('移动端检测到，跳过自动滚动');
            return;
        }
        
        console.log('启动自动滚动');
        let lastTime = 0;
        const scrollSpeed = 0.8; // 降低滚动速度，减少抖动
        
        const autoScroll = (currentTime) => {
            // 再次检查移动端
            if (this.isMobile || window.innerWidth <= 768 || 'ontouchstart' in window) {
                this.stopAutoScroll();
                return;
            }
            
            if (!this.isDragging && !this.isTransitioning) {
                const deltaTime = currentTime - lastTime;
                const moveDistance = (deltaTime / 16) * scrollSpeed; // 基于时间的平滑移动
                
                const currentTransform = this.getCurrentTransform();
                this.setTransform(currentTransform - moveDistance);
                
                lastTime = currentTime;
            }
            
            this.autoScrollInterval = requestAnimationFrame(autoScroll);
        };
        
        this.autoScrollInterval = requestAnimationFrame(autoScroll);
    }

    /**
     * 停止自动滚动
     */
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            cancelAnimationFrame(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        
        if (this.userInteractionTimeout) {
            clearTimeout(this.userInteractionTimeout);
        }
    }

    /**
     * 强制停止自动滚动（移动端专用）
     */
    forceStopAutoScroll() {
        console.log('强制停止移动端自动滚动');
        this.stopAutoScroll();
        
        // 额外检查，确保没有遗漏的定时器
        if (this.autoScrollInterval) {
            cancelAnimationFrame(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        
        if (this.userInteractionTimeout) {
            clearTimeout(this.userInteractionTimeout);
            this.userInteractionTimeout = null;
        }
    }

    /**
     * 启动动量滚动
     */
    startMomentumScroll() {
        // 如果动量太小，直接跳过
        if (Math.abs(this.momentum) < 0.1) {
            return;
        }
        
        this.cancelMomentumAnimation();
        
        const animate = () => {
            if (Math.abs(this.momentum) < 0.05) {
                this.momentum = 0;
                return;
            }
            
            const currentTransform = this.getCurrentTransform();
            this.setTransform(currentTransform + this.momentum * 20);
            
            // 应用摩擦力
            this.momentum *= 0.92;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * 取消动量动画
     */
    cancelMomentumAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * 延迟重启自动滚动
     */
    scheduleAutoScroll() {
        // 检查是否为移动端
        if (this.isMobile || window.innerWidth <= 768 || 'ontouchstart' in window) {
            console.log('移动端检测到，跳过延迟自动滚动');
            return;
        }
        
        this.userInteractionTimeout = setTimeout(() => {
            if (!this.isTransitioning && !this.isMobile) {
                this.startAutoScroll();
            }
        }, 3000); // 给用户足够时间观看
    }

    /**
     * 销毁实例，清理事件监听器
     */
    destroy() {
        this.stopAutoScroll();
        this.cancelMomentumAnimation();
        
        // 移除事件监听器
        this.galleryGrid.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.galleryGrid.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.galleryGrid.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.galleryGrid.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
        this.galleryGrid.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.galleryGrid.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.galleryGrid.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.galleryGrid.removeEventListener('dragstart', (e) => e.preventDefault());
    }
}

/**
 * 大赛实况视频播放控制功能
 * 实现点击播放/暂停功能，支持多个视频独立控制
 */
class VideoController {
    constructor() {
        this.videos = [];
        this.init();
    }

    /**
     * 初始化视频控制器
     */
    init() {
        const videoItems = document.querySelectorAll('[class*="videoItem"]');
        
        videoItems.forEach((item, index) => {
            const video = item.querySelector('video');
            const overlay = item.querySelector('[class*="videoOverlay"]');
            const playButton = item.querySelector('[class*="playButton"]');
            
            if (video && overlay && playButton) {
                const videoData = {
                    element: video,
                    overlay: overlay,
                    playButton: playButton,
                    container: item,
                    isPlaying: false,
                    index: index
                };
                
                this.videos.push(videoData);
                this.setupVideoEvents(videoData);
            }
        });
    }

    /**
     * 设置视频事件监听器
     */
    setupVideoEvents(videoData) {
        const { element, overlay, playButton, container } = videoData;
        
        // 点击播放按钮或视频覆盖层
        overlay.addEventListener('click', () => {
            this.toggleVideo(videoData);
        });
        
        // 视频播放事件
        element.addEventListener('play', () => {
            this.onVideoPlay(videoData);
        });
        
        // 视频暂停事件
        element.addEventListener('pause', () => {
            this.onVideoPause(videoData);
        });
        
        // 视频结束事件
        element.addEventListener('ended', () => {
            this.onVideoEnded(videoData);
        });
        
        // 视频加载错误事件
        element.addEventListener('error', () => {
            this.onVideoError(videoData);
        });
        
        // 视频点击事件（播放时点击暂停）
        element.addEventListener('click', () => {
            if (videoData.isPlaying) {
                this.pauseVideo(videoData);
            }
        });
    }

    /**
     * 切换视频播放状态
     */
    toggleVideo(videoData) {
        if (videoData.isPlaying) {
            this.pauseVideo(videoData);
        } else {
            this.playVideo(videoData);
        }
    }

    /**
     * 播放视频
     */
    playVideo(videoData) {
        // 暂停其他正在播放的视频
        this.pauseAllOtherVideos(videoData.index);
        
        const { element } = videoData;
        
        // 尝试播放视频
        const playPromise = element.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 播放成功
                console.log(`视频 ${videoData.index + 1} 开始播放`);
            }).catch(error => {
                // 播放失败
                console.error(`视频 ${videoData.index + 1} 播放失败:`, error);
                this.onVideoError(videoData);
            });
        }
    }

    /**
     * 暂停视频
     */
    pauseVideo(videoData) {
        const { element } = videoData;
        element.pause();
    }

    /**
     * 暂停除指定视频外的所有视频
     */
    pauseAllOtherVideos(currentIndex) {
        this.videos.forEach((videoData, index) => {
            if (index !== currentIndex && videoData.isPlaying) {
                this.pauseVideo(videoData);
            }
        });
    }

    /**
     * 视频开始播放时的处理
     */
    onVideoPlay(videoData) {
        const { overlay, container } = videoData;
        
        videoData.isPlaying = true;
        overlay.classList.add('playing');
        container.classList.add('playing');
        
        // 更新播放按钮为暂停图标
        this.updatePlayButton(videoData, 'pause');
    }

    /**
     * 视频暂停时的处理
     */
    onVideoPause(videoData) {
        const { overlay, container } = videoData;
        
        videoData.isPlaying = false;
        overlay.classList.remove('playing');
        container.classList.remove('playing');
        
        // 更新播放按钮为播放图标
        this.updatePlayButton(videoData, 'play');
    }

    /**
     * 视频结束时的处理
     */
    onVideoEnded(videoData) {
        const { element } = videoData;
        
        // 重置视频到开始位置
        element.currentTime = 0;
        this.onVideoPause(videoData);
    }

    /**
     * 视频加载错误时的处理
     */
    onVideoError(videoData) {
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
    }

    /**
     * 更新播放按钮图标
     */
    updatePlayButton(videoData, state) {
        const { playButton } = videoData;
        const svg = playButton.querySelector('svg');
        
        if (state === 'pause') {
            // 暂停图标
            svg.innerHTML = `
                <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.1)"/>
                <rect x="22" y="18" width="6" height="24" fill="rgba(255,255,255,0.1)"/>
                <rect x="32" y="18" width="6" height="24" fill="rgba(255,255,255,0.1)"/>
            `;
        } else {
            // 播放图标
            svg.innerHTML = `
                <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.9)"/>
                <path d="M23 18L23 42L42 30L23 18Z" fill="#2193b0"/>
            `;
        }
    }

    /**
     * 销毁实例，清理事件监听器
     */
    destroy() {
        this.videos.forEach(videoData => {
            const { element, overlay } = videoData;
            element.removeEventListener('play', this.onVideoPlay.bind(this, videoData));
            element.removeEventListener('pause', this.onVideoPause.bind(this, videoData));
            element.removeEventListener('ended', this.onVideoEnded.bind(this, videoData));
            element.removeEventListener('error', this.onVideoError.bind(this, videoData));
            overlay.removeEventListener('click', this.toggleVideo.bind(this, videoData));
        });
        this.videos = [];
    }
}

// React 组件包装器
export default function GalleryScrollerClass() {
    useEffect(() => {
        // 延迟初始化，确保 DOM 完全加载
        const timer = setTimeout(() => {
            const galleryScroller = new GalleryScroller();
            const videoController = new VideoController();

            // 清理函数
            return () => {
                galleryScroller.destroy();
                videoController.destroy();
            };
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return null; // 这个组件不渲染任何内容，只提供功能
}
