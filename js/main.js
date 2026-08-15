/**
 * 郭贤杰个人网站主JavaScript文件
 * 负责加载组件和数据
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 确保页面滚动到顶部
    window.scrollTo(0, 0);
    
    // 加载各部分数据
    loadBioData();
    loadResearchInterests();
    loadExperience();
    loadPublications();
    loadPatents();
    loadAwards();
    loadProjects();
    loadCompetitions();
    loadServices();
    loadStatCounter();
});

/**
 * 加载个人简介数据
 */
function loadBioData() {
    fetch('data/bio.json')
        .then(response => response.json())
        .then(data => {
            // Extract English and Chinese content
            window.bioContentEN = data.EN;
            window.bioContentCN = data.CN;

            // Default to English
            document.getElementById('bio-content').textContent = window.bioContentEN;
            
            // Set up language toggle
            setupLanguageToggle();
        })
        .catch(error => {
            console.error('加载个人简介数据时出错:', error);
        });
}

function setupLanguageToggle() {
    const toggleSwitch = document.getElementById('language-toggle');
    if (!toggleSwitch) return;
    
    toggleSwitch.addEventListener('change', function() {
        const bioContent = document.getElementById('bio-content');
        if (this.checked) {
            // Switch to Chinese
            bioContent.textContent = window.bioContentCN;
            bioContent.setAttribute('lang', 'zh-CN');
        } else {
            // Switch to English
            bioContent.textContent = window.bioContentEN;
            bioContent.setAttribute('lang', 'en');
        }
    });
}

/**
 * 加载研究兴趣
 */
function loadResearchInterests() {
    fetch('data/research.json')
        .then(response => response.json())
        .then(interests => {
            const container = document.getElementById('research-interests');
            const interestsHTML = document.createElement('div');
            interestsHTML.className = 'research-interests';
            
            interests.forEach(interest => {
                const tag = document.createElement('div');
                tag.className = 'research-tag';
                tag.innerHTML = `<i class="${interest.icon}"></i> ${interest.name}`;
                interestsHTML.appendChild(tag);
            });
            
            container.appendChild(interestsHTML);
        })
        .catch(error => {
            console.error('加载研究兴趣数据时出错:', error);
        });
}

/**
 * 加载教育与工作经历（合并为一个时间线，按起始时间倒序排列）
 * 工作经历与教育经历仍分别维护在 work.json / education.json 中
 */
function loadExperience() {
    Promise.all([
        fetch('data/work.json').then(response => response.json()),
        fetch('data/education.json').then(response => response.json())
    ])
        .then(([workData, educationData]) => {
            const timelineContainer = document.getElementById('experience-timeline');

            const items = [
                ...workData.map(item => ({ ...item, category: 'work' })),
                ...educationData.map(item => ({ ...item, category: 'education' }))
            ].sort((a, b) => periodStartValue(b.period) - periodStartValue(a.period));

            items.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = `timeline-item timeline-item-${item.category}`;

                const icon = item.category === 'work'
                    ? 'fa-solid fa-briefcase'
                    : 'fa-solid fa-graduation-cap';

                // 时间与地点同行显示，节省一行空间
                timelineItem.innerHTML = `
                    <div class="timeline-meta">
                        <span class="timeline-date">${item.period}</span>
                        <span class="timeline-location">
                            <i class="fas fa-map-marker-alt"></i> ${item.location}
                        </span>
                        <span class="timeline-tag"><i class="${icon}"></i> ${item.category === 'work' ? 'Work' : 'Education'}</span>
                    </div>
                    <div class="timeline-title">${item.title}</div>
                    ${item.details ? `<div class="timeline-details">${item.details}</div>` : ''}
                `;

                timelineContainer.appendChild(timelineItem);
            });
        })
        .catch(error => {
            console.error('加载教育与工作经历数据时出错:', error);
        });
}

/**
 * 将 "2026.01 ~ Present" 形式的起始时间转换为可比较的数值
 * @param {string} period - 时间区间字符串
 * @returns {number} 形如 202601 的数值，解析失败时返回 0
 */
function periodStartValue(period) {
    const match = /(\d{4})[.\-/](\d{1,2})/.exec(period || '');
    if (!match) {
        const yearOnly = /(\d{4})/.exec(period || '');
        return yearOnly ? Number(yearOnly[1]) * 100 : 0;
    }
    return Number(match[1]) * 100 + Number(match[2]);
}

/**
 * 加载学术论文
 */
function loadPublications() {
    fetch('data/publications.json')
        .then(response => response.json())
        .then(data => {
            renderPublications(data);
        })
        .catch(error => {
            console.error('加载发布数据时出错:', error);
        });
}

/**
 * 渲染发布内容
 * @param {Array} data - 论文数据
 */
function renderPublications(data) {
    const publicationsContainer = document.getElementById('publications-container');
    
    // 按年份对论文进行分组
    const publicationsByYear = groupByYear(data);
    
    // 对年份进行排序（降序）
    const sortedYears = Object.keys(publicationsByYear).sort((a, b) => b - a);
    
    // 对每个年份的论文进行渲染
    sortedYears.forEach(year => {
        // 创建年份标题
        const yearTitle = document.createElement('div');
        yearTitle.className = 'publication-year';
        yearTitle.textContent = year;
        publicationsContainer.appendChild(yearTitle);
        
        // 渲染该年份的所有论文
        publicationsByYear[year].forEach(publication => {
            const pubItem = createPublicationItem(publication);
            publicationsContainer.appendChild(pubItem);
        });
    });
}

/**
 * 按年份对论文进行分组
 * @param {Array} publications - 论文数组
 * @returns {Object} 按年份分组的论文对象
 */
function groupByYear(publications) {
    return publications.reduce((groups, pub) => {
        const year = pub.year;
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(pub);
        return groups;
    }, {});
}

/**
 * 创建单个论文项
 * @param {Object} publication - 论文数据
 * @returns {HTMLElement} 论文项DOM元素
 */
function createPublicationItem(publication) {
    const pubItem = document.createElement('div');
    pubItem.className = 'publication-item';
    
    // 论文标题
    const titleElement = document.createElement('div');
    titleElement.className = 'publication-title';
    titleElement.innerHTML = publication.url 
        ? `<a href="${publication.url}">${publication.title}</a>`
        : publication.title;
    pubItem.appendChild(titleElement);
    
    // 作者
    const authorsElement = document.createElement('div');
    authorsElement.className = 'publication-authors';
    authorsElement.innerHTML = formatAuthors(publication.authors);
    pubItem.appendChild(authorsElement);
    
    // 发表期刊/会议
    const venueElement = document.createElement('div');
    venueElement.className = 'publication-venue';
    venueElement.textContent = publication.venue;
    pubItem.appendChild(venueElement);
    
    // 标签与相关链接合并为同一行，节省纵向空间
    const hasBadges = publication.badges && publication.badges.length > 0;
    const hasLinks = publication.links && publication.links.length > 0;

    if (hasBadges || hasLinks) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'publication-meta';

        if (hasBadges) {
            publication.badges.forEach(badge => {
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'publication-badge';
                badgeSpan.innerHTML = `<i class="fas fa-${badge.icon}"></i> ${badge.text}`;
                metaDiv.appendChild(badgeSpan);
            });
        }

        // 标签与链接之间的分隔符
        if (hasBadges && hasLinks) {
            const separator = document.createElement('span');
            separator.className = 'publication-meta-sep';
            separator.setAttribute('aria-hidden', 'true');
            metaDiv.appendChild(separator);
        }

        if (hasLinks) {
            publication.links.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.className = 'publication-link';
                linkElement.href = link.url;
                linkElement.innerHTML = `<i class="fa-solid fa-${link.icon}"></i> ${link.text}`;
                metaDiv.appendChild(linkElement);
            });
        }

        pubItem.appendChild(metaDiv);
    }

    return pubItem;
}

/** 本人姓名的所有写法 */
const SELF_AUTHOR_NAMES = ['Xianjie Guo', '郭贤杰'];

/**
 * 格式化作者列表：加粗本人名字，并为通讯作者追加标记
 * 支持的写法（括号内容大小写不敏感）：
 *   "Xianjie Guo"
 *   "Xianjie Guo (co-first author)"
 *   "Xianjie Guo (corresponding author)"
 *   "Xianjie Guo (co-first author, corresponding author)"
 * @param {Array} authors - 作者数组
 * @returns {string} 格式化后的HTML
 */
function formatAuthors(authors) {
    return authors.map(author => {
        // 去掉尾部括号注释后得到纯姓名，用于判断是否为本人
        const baseName = author.replace(/\s*\([^)]*\)\s*$/, '').trim();
        if (!SELF_AUTHOR_NAMES.includes(baseName)) {
            return author;
        }

        const isCorresponding = /corresponding\s+author/i.test(author);
        // 通讯作者标记单独以图标呈现，其余括号注释（如 co-first author）保留原文
        const inlineNote = isCorresponding
            ? author.replace(/\s*\([^)]*\)\s*$/, match => {
                const cleaned = match
                    .replace(/[()]/g, '')
                    .split(/[,;、]/)
                    .map(part => part.trim())
                    .filter(part => part && !/corresponding\s+author/i.test(part))
                    .join(', ');
                return cleaned ? ` (${cleaned})` : '';
            })
            : author;

        let html = `<b>${inlineNote}</b>`;
        if (isCorresponding) {
            html += `<i class="fas fa-envelope corresponding-mark" title="Corresponding author" aria-label="Corresponding author"></i>`;
        }
        return html;
    }).join(', ');
}

/**
 * 加载发明专利
 */
function loadPatents() {
    fetch('data/patents.json')
        .then(response => response.json())
        .then(patentsData => {
            const patentsContainer = document.getElementById('patents-container');

            patentsData.forEach(patent => {
                const patentItem = document.createElement('div');
                patentItem.className = 'compact-item';
                patentItem.innerHTML = `
                    <div class="compact-title">${patent.title}</div>
                    <div class="compact-meta">
                        <span><i class="fas fa-users"></i> ${formatAuthors(patent.inventors)}</span>
                        <span><i class="fas fa-hashtag"></i> ${patent.number}</span>
                        <span><i class="fa-solid fa-calendar-days"></i> ${patent.date}</span>
                    </div>
                `;
                patentsContainer.appendChild(patentItem);
            });
        })
        .catch(error => {
            console.error('加载发明专利数据时出错:', error);
        });
}

/**
 * 加载学科竞赛获奖
 */
function loadCompetitions() {
    fetch('data/competitions.json')
        .then(response => response.json())
        .then(competitionsData => {
            const competitionsContainer = document.getElementById('competitions-container');

            competitionsData.forEach(competition => {
                const competitionItem = document.createElement('div');
                competitionItem.className = 'compact-item';
                competitionItem.innerHTML = `
                    <div class="compact-title">${competition.year}年${competition.title}</div>
                    <div class="compact-meta">
                        <span class="compact-badge"><i class="fa-solid fa-award"></i> ${competition.prize}</span>
                        <span><i class="fa-solid fa-user-graduate"></i> ${competition.students.join('、')}</span>
                    </div>
                `;
                competitionsContainer.appendChild(competitionItem);
            });
        })
        .catch(error => {
            console.error('加载学科竞赛数据时出错:', error);
        });
}

/**
 * 加载荣誉奖励
 */
function loadAwards() {
    fetch('data/awards.json')
        .then(response => response.json())
        .then(awardsData => {
            const awardsContainer = document.getElementById('awards-container');
            
            awardsData.forEach(award => {
                const awardItem = document.createElement('div');
                awardItem.className = 'award-item';
                awardItem.innerHTML = `
                    <div class="award-title">${award.title}</div>
                    <div class="award-date"><i class="fa-solid fa-calendar-days"></i> ${award.date}</div>
                    ${award.description ? `<div class="award-description"><i class="fa-regular fa-clipboard"></i> ${award.description}</div>` : ''}
                `;
                awardsContainer.appendChild(awardItem);
            });
        })
        .catch(error => {
            console.error('加载奖项数据时出错:', error);
        });
}

/**
 * 加载课题项目
 */
function loadProjects() {
    fetch('data/projects.json')
        .then(response => response.json())
        .then(projectsData => {
            const projectsContainer = document.getElementById('projects-container');
            
            projectsData.forEach(project => {
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                projectItem.innerHTML = `
                    <div class="project-title">${project.title} (No. ${project.number}), ${project.period}</div>
                    <div class="project-meta">
                        <span><i class="fas fa-user"></i> ${project.role}</span>
                        ${project.status ? `<span><i class="fas fa-info-circle"></i> 状态: ${project.status}</span>` : ''}
                    </div>
                    <div class="project-description">${project.type}</div>
                `;
                
                projectsContainer.appendChild(projectItem);
            });
        })
        .catch(error => {
            console.error('加载项目数据时出错:', error);
        });
}

/**
 * 加载学术服务
 */
function loadServices() {
    fetch('data/services.json')
        .then(response => response.json())
        .then(servicesData => {
            const servicesContainer = document.getElementById('services-container');
            
            // 期刊审稿服务
            const journalService = document.createElement('div');
            journalService.className = 'service-item';
            journalService.innerHTML = `
                <div class="service-title"><i class="fas fa-book-open"></i> Journal Reviewer</div>
                <ul class="service-list">
                    ${servicesData.journals.map(journal => `<li>${journal}</li>`).join('')}
                </ul>
            `;
            servicesContainer.appendChild(journalService);
            
            // 会议审稿服务
            const conferenceService = document.createElement('div');
            conferenceService.className = 'service-item';
            conferenceService.innerHTML = `
                <div class="service-title"><i class="fas fa-users"></i> Conference Reviewer</div>
                <ul class="service-list">
                    ${servicesData.conferences.map(conference => `<li>${conference}</li>`).join('')}
                </ul>
            `;
            servicesContainer.appendChild(conferenceService);
        })
        .catch(error => {
            console.error('加载学术服务数据时出错:', error);
        });
}

/** 访问统计数值所在元素的 id（不蒜子/VerCount 通用规范） */
const COUNTER_VALUE_IDS = ['busuanzi_value_site_pv', 'busuanzi_value_site_uv'];

/** stats.json 缺失或损坏时使用的默认配置 */
const DEFAULT_STATS = {
    stats_start_date: 'December 2023',
    counter_scripts: [
        'https://cn.vercount.one/js',
        'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
    ],
    badge_image_url: 'https://count.getloli.com/get/@xianjie-guo-homepage?theme=moebooru',
    badge_link_url: 'https://count.getloli.com/'
};

/**
 * 加载网站访问统计
 */
function loadStatCounter() {
    fetch('data/stats.json')
        .then(response => response.json())
        .then(stats => {
            renderStatCounter(Object.assign({}, DEFAULT_STATS, stats));
        })
        .catch(error => {
            console.error('加载统计数据时出错:', error);
            renderStatCounter(DEFAULT_STATS);
        });
}

/**
 * 渲染访问统计区域
 * @param {Object} stats - 统计配置
 */
function renderStatCounter(stats) {
    const statsContainer = document.getElementById('stats-counter');

    statsContainer.innerHTML = `
        <div class="visit-stats">
            <div class="visit-stat-card">
                <div class="visit-stat-value"><span id="busuanzi_value_site_pv">--</span></div>
                <div class="visit-stat-label"><i class="fas fa-eye"></i> Total Page Views</div>
            </div>
            <div class="visit-stat-card">
                <div class="visit-stat-value"><span id="busuanzi_value_site_uv">--</span></div>
                <div class="visit-stat-label"><i class="fas fa-users"></i> Unique Visitors</div>
            </div>
        </div>
        ${stats.badge_image_url ? `
        <a class="visit-badge-link" href="${stats.badge_link_url || stats.badge_image_url}" title="Visit counter" target="_blank" rel="noopener">
            <img class="visit-badge" src="${stats.badge_image_url}" alt="Website visit counter" loading="lazy" />
        </a>` : ''}
        <p>Website Visit Statistics (Since ${stats.stats_start_date})</p>
    `;

    // 图片计数器若不可用则整体隐藏，避免出现破损图标
    const badge = statsContainer.querySelector('.visit-badge');
    if (badge) {
        badge.addEventListener('error', () => {
            const wrapper = badge.closest('.visit-badge-link') || badge;
            wrapper.style.display = 'none';
        });
    }

    loadCounterScript(stats.counter_scripts || [], 0);
}

/**
 * 依次尝试各个统计脚本来源，任意一个成功回填数值即停止
 * @param {Array<string>} urls - 统计脚本地址列表
 * @param {number} index - 当前尝试的下标
 */
function loadCounterScript(urls, index) {
    if (index >= urls.length) {
        markCounterUnavailable();
        return;
    }

    const script = document.createElement('script');
    script.src = urls[index];
    script.async = true;
    let settled = false;

    const tryNext = () => {
        if (settled) return;
        settled = true;
        script.remove();
        loadCounterScript(urls, index + 1);
    };

    script.addEventListener('error', tryNext);
    // 脚本加载成功后仍可能因服务异常而未回填数值，故延迟校验
    script.addEventListener('load', () => {
        setTimeout(() => {
            if (settled) return;
            if (counterHasValue()) {
                settled = true;
                return;
            }
            tryNext();
        }, 3000);
    });
    // 脚本长时间无响应时切换到下一个来源
    setTimeout(() => {
        if (!settled && !counterHasValue()) tryNext();
    }, 8000);

    document.body.appendChild(script);
}

/**
 * 判断统计数值是否已成功回填
 * @returns {boolean}
 */
function counterHasValue() {
    return COUNTER_VALUE_IDS.some(id => {
        const element = document.getElementById(id);
        return element && /\d/.test(element.textContent || '');
    });
}

/**
 * 所有统计来源均不可用时的兜底展示
 */
function markCounterUnavailable() {
    console.warn('所有访问统计来源均不可用');
    COUNTER_VALUE_IDS.forEach(id => {
        const element = document.getElementById(id);
        if (element && !/\d/.test(element.textContent || '')) {
            element.textContent = 'N/A';
        }
    });
}
