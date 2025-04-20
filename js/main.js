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
    loadWork();
    loadEducation();
    loadPublications();
    loadAwards();
    loadProjects();
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
 * 加载工作经历
 */
function loadWork() {
    fetch('data/work.json')
        .then(response => response.json())
        .then(workData => {
            const timelineContainer = document.getElementById('work-timeline');
            
            workData.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                timelineItem.innerHTML = `
                    <div class="timeline-date">${item.period}</div>
                    <div class="timeline-title">${item.title}</div>
                    <div class="timeline-location">
                        <i class="fas fa-map-marker-alt"></i> ${item.location}
                    </div>
                    ${item.details ? `<div>${item.details}</div>` : ''}
                `;
                
                timelineContainer.appendChild(timelineItem);
            });
        })
        .catch(error => {
            console.error('加载工作经历数据时出错:', error);
        });
}

/**
 * 加载教育经历
 */
function loadEducation() {
    fetch('data/education.json')
        .then(response => response.json())
        .then(educationData => {
            const timelineContainer = document.getElementById('education-timeline');
            
            educationData.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                timelineItem.innerHTML = `
                    <div class="timeline-date">${item.period}</div>
                    <div class="timeline-title">${item.title}</div>
                    <div class="timeline-location">
                        <i class="fas fa-map-marker-alt"></i> ${item.location}
                    </div>
                    ${item.details ? `<div>${item.details}</div>` : ''}
                `;
                
                timelineContainer.appendChild(timelineItem);
            });
        })
        .catch(error => {
            console.error('加载教育经历数据时出错:', error);
        });
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
    
    // 标签
    if (publication.badges && publication.badges.length > 0) {
        const badgesDiv = document.createElement('div');
        publication.badges.forEach(badge => {
            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'publication-badge';
            badgeSpan.innerHTML = `<i class="fas fa-${badge.icon}"></i> ${badge.text}`;
            badgesDiv.appendChild(badgeSpan);
        });
        pubItem.appendChild(badgesDiv);
    }
    
    // 相关链接
    if (publication.links && publication.links.length > 0) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'publication-links';
        
        publication.links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.className = 'publication-link';
            linkElement.href = link.url;
            linkElement.innerHTML = `<i class="fa-solid fa-${link.icon}"></i> ${link.text}`;
            linksDiv.appendChild(linkElement);
        });
        
        pubItem.appendChild(linksDiv);
    }
    
    return pubItem;
}

/**
 * 格式化作者列表，加粗本人名字
 * @param {Array} authors - 作者数组
 * @returns {string} 格式化后的HTML
 */
function formatAuthors(authors) {
    return authors.map(author => {
        if (author === 'Xianjie Guo') {
            return `<b>${author}</b>`;
        }
        if (author === 'Xianjie Guo (co-first author)') {
            return `<b>${author}</b>`;
        }
        if (author === '郭贤杰') {
            return `<b>${author}</b>`;
        }
        return author;
    }).join(', ');
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

/**
 * 加载网站访问统计
 */
function loadStatCounter() {
    fetch('data/stats.json')
        .then(response => response.json())
        .then(stats => {
            const statsContainer = document.getElementById('stats-counter');
            statsContainer.innerHTML = `
                <a href="${stats.stats_url}" title="Visit tracker">
                    <img src="${stats.stats_image_url}" />
                </a>
                <p>Website Visit Statistics (Since ${stats.stats_start_date})</p>
            `;
        })
        .catch(error => {
            console.error('加载统计数据时出错:', error);
            // 使用默认统计信息
            const statsContainer = document.getElementById('stats-counter');
            statsContainer.innerHTML = `
                <a href="https://clustrmaps.com/site/1bxn1" title="Visit tracker">
                    <img src="//www.clustrmaps.com/map_v2.png?d=4V6eYQ2IPE90W5uH_zCPr6SfzhrxmDDztM3gjnQ8ILE&cl=ffffff" />
                </a>
                <p>网站访问统计 (自2023年12月起)</p>
            `;
        });
}
