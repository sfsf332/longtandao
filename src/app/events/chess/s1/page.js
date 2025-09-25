import Image from 'next/image';
import styles from './page.module.css';

export default function ChessTournament() {
  return (
    <div className={styles.backgroundOverlay} style={{
      fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
      lineHeight: '1.6',
      color: '#333',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <div className={styles.overlay}></div>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>第一届龙潭棋王争霸赛</h1>
          <p className={styles.subtitle}>DAO龙潭数字游民基地主办</p>
        </div>
      </header>

      {/* 实物奖品 */}
      <section className={`${styles.section} ${styles.prizes}`}>
        <h2 className={styles.sectionTitle}>实物奖品<div className={styles.sectionTitleUnderline}></div></h2>
        <div className={styles.prizesGrid}>
          <div className={`${styles.prizeItem} ${styles.champion}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>冠军</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No1.jpg" alt="纳万福芭提雅香米10kg" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>纳万福芭提雅香米10kg</div>
            <div className={styles.prizeValue}>价值 ￥99</div>
          </div>
          <div className={`${styles.prizeItem} ${styles.runnerUp}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>亚军</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No2.jpg" alt="盛洲非转基因葵花籽油5L" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>盛洲非转基因葵花籽油5L</div>
            <div className={styles.prizeValue}>价值 ￥69.9</div>
          </div>
          <div className={`${styles.prizeItem} ${styles.thirdPlace}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>季军</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No3.jpg" alt="立白洗衣大礼包" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>立白洗衣大礼包</div>
            <div className={styles.prizeValue}>价值 ￥50</div>
          </div>
          <div className={`${styles.prizeItem} ${styles.fourthPlace}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>第4名</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No4.jpg" alt="金蝶手拍拉面*2" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>金蝶手拍拉面*2</div>
            <div className={styles.prizeValue}>价值 ￥30</div>
          </div>
          <div className={`${styles.prizeItem} ${styles.fifthEighth}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>第5~8名</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No5.jpg" alt="超恩528系列卷纸*1" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>超恩528系列卷纸*1</div>
            <div className={styles.prizeValue}>价值 ￥15</div>
          </div>
          <div className={`${styles.prizeItem} ${styles.ninthSixteenth}`}>
            <div className={styles.prizeItemTopBar}></div>
            <div className={styles.prizeRank}>第9~16名</div>
            <div className={styles.prizeImage}>
              <Image src="/s1/No6.jpg" alt="厨邦金品生抽1.25L" width={200} height={200} />
            </div>
            <div className={styles.prizeName}>厨邦金品生抽1.25L</div>
            <div className={styles.prizeValue}>价值 ￥9.9</div>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.container}>
          {/* 报名信息 */}
          <section className={`${styles.section} ${styles.registration}`}>
            <h2 className={styles.sectionTitle}>线下报名<div className={styles.sectionTitleUnderline}></div></h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h3>报名时间</h3>
                <p>9月26日 18:00</p>
              </div>
              <div className={styles.infoItem}>
                <h3>报名地点</h3>
                <p>福建省宁德市屏南县<br />龙潭村村口广场"凤凰台"下</p>
              </div>
              <div className={styles.infoItem}>
                <h3>报名方式</h3>
                <p>向赛事工作组提供昵称、住址、联系方式</p>
              </div>
            </div>
          </section>

          {/* 赛制说明 */}
          <section className={`${styles.section} ${styles.tournamentFormat}`}>
            <h2 className={styles.sectionTitle}>赛制<div className={styles.sectionTitleUnderline}></div></h2>
            <p className={styles.formatDescription}>淘汰赛。初赛1场：16进8，正赛1场：8进4，半决赛1场：4进2，决赛3局2胜：争冠军。</p>
            <div className={styles.tournamentBracketImage}>
              <Image src="/s1/tournament_bracket.png" alt="赛制图" width={800} height={400} />
            </div>
            <div className={styles.rounds}>
              <div className={styles.round}>
                <span className={styles.roundNumber}>1</span>
                <span className={styles.roundName}>第一局：16进8</span>
              </div>
              <div className={styles.round}>
                <span className={styles.roundNumber}>2</span>
                <span className={styles.roundName}>第二局：8进4</span>
              </div>
              <div className={styles.round}>
                <span className={styles.roundNumber}>3</span>
                <span className={styles.roundName}>第三局：4进2</span>
              </div>
              <div className={styles.round}>
                <span className={styles.roundNumber}>4</span>
                <span className={styles.roundName}>第四局：争季军</span>
              </div>
              <div className={styles.round}>
                <span className={styles.roundNumber}>5-7</span>
                <span className={styles.roundName}>第五局~第七局：总决赛，争夺冠亚军，3局2胜</span>
              </div>
            </div>
          </section>

          {/* 赛程安排 */}
          <section className={`${styles.section} ${styles.schedule}`}>
            <h2 className={styles.sectionTitle}>赛程<div className={styles.sectionTitleUnderline}></div></h2>
            <div className={styles.scheduleGrid}>
              <div className={styles.scheduleItem}>
                <div className={styles.scheduleDate}>9月28日</div>
                <div className={styles.scheduleTime}>18:00-18:30</div>
                <div className={styles.scheduleEvent}>预赛（16进8）</div>
              </div>
              <div className={styles.scheduleItem}>
                <div className={styles.scheduleDate}>9月28日</div>
                <div className={styles.scheduleTime}>18:45-19:15</div>
                <div className={styles.scheduleEvent}>正赛（8进4）</div>
              </div>
              <div className={styles.scheduleItem}>
                <div className={styles.scheduleDate}>9月28日</div>
                <div className={styles.scheduleTime}>19:30-20:00</div>
                <div className={styles.scheduleEvent}>半决赛（4进2）</div>
              </div>
              <div className={styles.scheduleItem}>
                <div className={styles.scheduleDate}>10月5日</div>
                <div className={styles.scheduleTime}>18:00-18:30</div>
                <div className={styles.scheduleEvent}>季军争夺赛</div>
              </div>
              <div className={styles.scheduleItem}>
                <div className={styles.scheduleDate}>10月5日</div>
                <div className={styles.scheduleTime}>18:45-20:15</div>
                <div className={styles.scheduleEvent}>冠亚军争夺赛（3局2胜制）</div>
              </div>
            </div>
          </section>

          {/* 守擂规则 */}
          <section className={`${styles.section} ${styles.defenseRules}`}>
            <h2 className={styles.sectionTitle}>守擂<div className={styles.sectionTitleUnderline}></div></h2>
            <div className={styles.rulesContent}>
              <p>冠亚季军，需要在下一届龙潭棋王争霸赛之前，进行守擂。</p>
              <p>后续外来游客/数字游民，挑战者每次挑战，需要缴纳费用（冠军/亚军/季军：￥10/￥5/￥2）。</p>
              <p>挑战成功，可以获得神秘大礼。</p>
            </div>
          </section>

          {/* 组织信息 */}
          <section className={`${styles.section} ${styles.organizers}`}>
            <h2 className={styles.sectionTitle}>组织信息<div className={styles.sectionTitleUnderline}></div></h2>
            <div className={styles.organizerInfo}>
              <div className={styles.organizerItem}>
                <h3>主办方</h3>
                <p>DAO龙潭数字游民基地</p>
              </div>
              <div className={styles.organizerItem}>
                <h3>赛事工作组</h3>
                <p>白鱼、行天、Fivea</p>
              </div>
              <div className={styles.organizerItem}>
                <h3>顾问</h3>
                <p>陈小倩</p>
              </div>
            </div>
            <p className={styles.disclaimer}>最终活动解释权，归DAO龙潭数字游民基地所有。</p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; 2025 DAO龙潭数字游民基地 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
