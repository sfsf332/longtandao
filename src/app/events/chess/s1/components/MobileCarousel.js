'use client';

import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';
import styles from '../page.module.css';

export default function MobileCarousel() {
  const images = [
    { src: '/photo/duiyi0.jpg', alt: '激烈的对弈现场', caption: '激烈的对弈现场' },
    { src: '/photo/duiyi1.jpg', alt: '选手专注思考', caption: '选手专注思考' },
    { src: '/photo/duiyi2.jpg', alt: '棋局精彩对决', caption: '棋局精彩对决' },
    { src: '/photo/duiyi3.jpg', alt: '高手过招瞬间', caption: '高手过招瞬间' },
    { src: '/photo/duiyi4.jpg', alt: '深度思考时刻', caption: '深度思考时刻' },
    { src: '/photo/duiyi5.jpg', alt: '棋手风采展示', caption: '棋手风采展示' },
    { src: '/photo/duiyi6.jpg', alt: '紧张对弈氛围', caption: '紧张对弈氛围' },
    { src: '/photo/duiyi7.jpg', alt: '智慧的较量', caption: '智慧的较量' },
    { src: '/photo/duiyi8.jpg', alt: '精彩对局收官', caption: '精彩对局收官' },
    { src: '/photo/duiyi9.jpg', alt: '精彩瞬间记录', caption: '精彩瞬间记录' },
    { src: '/photo/lingjiang1.jpg', alt: '颁奖典礼', caption: '来打酱油也光荣' },
    { src: '/photo/weiguan0.jpg', alt: '观众围观1', caption: '观众热情围观' },
    { src: '/photo/weiguan1.jpg', alt: '观众围观2', caption: '现场气氛热烈' },
    { src: '/photo/weiguan2.jpg', alt: '观众围观3', caption: '观众专注观赛' },
    { src: '/photo/weiguan3.jpg', alt: '观众围观4', caption: '围观群众助威' },
    { src: '/photo/weiguan4.jpg', alt: '观众围观5', caption: '观赛人群聚集' },
    { src: '/photo/weiguan5.jpg', alt: '观众围观6', caption: '现场观众互动' },
    { src: '/photo/weiguan6.jpg', alt: '观众围观7', caption: '观众津津有味' },
    { src: '/photo/weiguan7.jpg', alt: '观众围观8', caption: '围观学习交流' },
    { src: '/photo/weiguan8.jpg', alt: '观众围观9', caption: '棋手专注对弈' },
    { src: '/photo/xianchang1.jpg', alt: '比赛现场1', caption: '比赛现场全景' },
    { src: '/photo/xianchang2.jpg', alt: '比赛现场2', caption: '赛事组织有序' },
    { src: '/photo/xianchang3.jpg', alt: '比赛现场3', caption: '现场布置整齐' }
  ];

  return (
    <section className={`${styles.section} ${styles.gallery}`}>
      <h2 className={styles.sectionTitle}>大赛风采<div className={styles.sectionTitleUnderline}></div></h2>
      <div className={styles.mobileCarouselContainer}>
        <Carousel
          showArrows={true}
          showThumbs={false}
          showStatus={false}
          infiniteLoop={true}
          autoPlay={false}
          interval={3000}
          transitionTime={500}
          swipeable={true}
          emulateTouch={true}
          dynamicHeight={false}
          centerMode={false}
          centerSlidePercentage={100}
          className={styles.mobileCarousel}
        >
          {images.map((image, index) => (
            <div key={index} className={styles.carouselItem}>
              <div className={styles.carouselImage}>
                <Image 
                  src={image.src} 
                  alt={image.alt} 
                  width={400} 
                  height={300}
                  priority={index < 3} // 优先加载前3张图片
                />
              </div>
              <div className={styles.carouselCaption}>
                <p>{image.caption}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
