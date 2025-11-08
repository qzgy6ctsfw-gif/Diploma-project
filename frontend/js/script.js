const API_URL = '/api';

class VideoHubApp {
    constructor() {
        this.currentUser = null;
        this.allVideos = [];
        this.categories = [];
        this.init();
    }

    init() {
        console.log('Initializing VideoHubApp...');
        this.injectDeleteButtonStyles();
        this.injectCommentsStyles();
        this.checkAuthStatus();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupVideoUpload();
        this.setupStoryUpload();
        this.setupExternalLinks();
        this.setupFooterLinks();
        this.loadAllContent();
        this.loadCategories();
    }

    // Стили для кнопки удаления
    injectDeleteButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .video-card-header {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }

            .delete-btn-card {
                background: rgba(255, 59, 48, 0.9);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                font-size: 16px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(5px);
            }

            .delete-btn-card:hover {
                background: rgba(255, 0, 0, 1);
                transform: scale(1.15);
                box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
            }

            .video-thumbnail-container {
                position: relative;
            }

            .video-card {
                position: relative;
                transition: transform 0.2s ease;
            }

            .video-card:hover {
                transform: translateY(-5px);
            }
        `;
        document.head.appendChild(style);
    }

    // Стили для комментариев
    injectCommentsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .comments-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
            }

            .comments-modal.active {
                display: block;
            }

            .comments-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }

            .comments-modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                background: #1a1a1a;
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .comments-modal-header {
                padding: 1.5rem;
                background: #2a2a2a;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .comments-modal-header h3 {
                margin: 0;
                color: white;
                font-size: 1.2rem;
                font-weight: 600;
            }

            .close-btn {
                background: none;
                border: none;
                color: #aaa;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-btn:hover {
                background: #333;
                color: white;
            }

            .comments-section {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }

            .add-comment-form {
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #333;
            }

            .comment-textarea {
                width: 100%;
                min-height: 80px;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 1rem;
                color: white;
                font-family: inherit;
                resize: vertical;
                margin-bottom: 1rem;
                transition: all 0.3s ease;
            }

            .comment-textarea:focus {
                outline: none;
                border-color: #ff0000;
                box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
            }

            .submit-comment-btn {
                background: #ff0000;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .submit-comment-btn:hover {
                background: #cc0000;
                transform: translateY(-2px);
            }

            .comments-list {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .comment {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: #2a2a2a;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .comment-avatar {
                font-size: 2rem;
                color: #666;
                flex-shrink: 0;
            }

            .comment-content {
                flex: 1;
            }

            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .comment-author {
                font-weight: 500;
                color: white;
                font-size: 0.9rem;
            }

            .comment-date {
                font-size: 0.8rem;
                color: #888;
            }

            .comment-text {
                color: #ddd;
                line-height: 1.5;
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
            }

            .comment-actions {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .comment-action-btn {
                background: none;
                border: none;
                color: #888;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 4px;
                transition: all 0.3s ease;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }

            .comment-action-btn:hover {
                background: #333;
                color: white;
            }

            .comment-action-btn.liked {
                color: #ff0000;
            }

            .comment-action-btn.delete-btn:hover {
                color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }

            .reply-form {
                margin-top: 1rem;
                padding: 1rem;
                background: #222;
                border-radius: 8px;
                border-left: 3px solid #ff0000;
            }

            .reply-textarea {
                width: 100%;
                min-height: 60px;
                background: #333;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 0.75rem;
                color: white;
                font-family: inherit;
                resize: vertical;
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
            }

            .reply-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }

            .cancel-reply-btn,
            .submit-reply-btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            }

            .cancel-reply-btn {
                background: #444;
                color: white;
            }

            .submit-reply-btn {
                background: #ff0000;
                color: white;
            }

            .cancel-reply-btn:hover {
                background: #555;
            }

            .submit-reply-btn:hover {
                background: #cc0000;
            }

            .comment-replies {
                margin-left: 2rem;
                margin-top: 1rem;
                border-left: 2px solid #333;
                padding-left: 1rem;
            }

            .comment-replies .comment {
                background: #222;
                margin-bottom: 0.75rem;
                padding: 0.75rem;
            }

            .comment-replies .comment-avatar {
                font-size: 1.5rem;
            }

            .no-comments {
                text-align: center;
                padding: 3rem;
                color: #666;
            }

            .no-comments i {
                font-size: 3rem;
                margin-bottom: 1rem;
                display: block;
            }

            .no-comments p {
                margin: 0;
                font-size: 1rem;
            }

            .comment-btn {
                background: #2a2a2a !important;
                color: white !important;
            }

            .comment-btn:hover {
                background: #3a3a3a !important;
                transform: translateY(-2px);
            }

            @media (max-width: 768px) {
                .comments-modal-content {
                    width: 95%;
                    height: 90vh;
                    max-width: none;
                }
                
                .comment-replies {
                    margin-left: 1rem;
                }
                
                .comment-actions {
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .comment {
                    padding: 0.75rem;
                }
                
                .comments-section {
                    padding: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUserInterface();
            } catch (e) {
                console.error('Error parsing saved user:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    setupExternalLinks() {
        console.log('Setting up external links...');

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const href = link.href.toLowerCase();
                if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                    e.preventDefault();
                    console.log('Opening external link:', href);
                    window.open(link.href, '_blank');
                }
            }
        });
    }

    setupFooterLinks() {
        console.log('Setting up footer links...');

        const socialLinks = document.querySelectorAll('.social-links a');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('http')) {
                    return;
                }
                e.preventDefault();
            });
        });

        const helpLinks = document.querySelectorAll('.footer-links a[href*="support"], .footer-links a[href*="about"]');
        helpLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('http')) {
                    return;
                }
                e.preventDefault();
            });
        });
    }

    setupVideoUpload() {
        const thumbnailInput = document.getElementById('thumbnailInput');
        const thumbnailPreview = document.getElementById('thumbnailPreview');

        if (thumbnailInput && thumbnailPreview) {
            thumbnailInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        thumbnailPreview.innerHTML = `
                            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                            <p>Превью загружено</p>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    setupStoryUpload() {
        const storyThumbnailInput = document.getElementById('storyThumbnailInput');
        const storyThumbnailPreview = document.getElementById('storyThumbnailPreview');

        if (storyThumbnailInput && storyThumbnailPreview) {
            storyThumbnailInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        storyThumbnailPreview.innerHTML = `
                            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                            <p>Превью загружено</p>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            const navLinks = sidebar.querySelectorAll('.nav-item');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                    }
                });
            });
        }
    }

    setupNavigation() {
        console.log('Setting up navigation...');

        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (!href) return;

                const targetId = href.substring(1);
                console.log('Navigation clicked:', targetId);

                this.showSection(targetId);
            });
        });

        const loginBtn = document.getElementById('headerLoginBtn');
        const registerBtn = document.getElementById('headerRegisterBtn');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        console.log('Auth buttons found:', { loginBtn, registerBtn, logoutBtn });

        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Login button clicked');
                this.showSection('login');
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Register button clicked');
                this.showSection('register');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        setTimeout(() => {
            this.showSection('main');
        }, 100);
    }

    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        const sections = document.querySelectorAll('.content-section');
        const navItems = document.querySelectorAll('.nav-item');

        sections.forEach(section => {
            section.classList.remove('active');
        });

        navItems.forEach(nav => {
            nav.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const correspondingNav = document.querySelector(`[href="#${sectionId}"]`);
        if (correspondingNav) {
            correspondingNav.classList.add('active');
        }

        this.loadSectionContent(sectionId);
    }

    async loadAllContent() {
        await this.loadVideos();
        await this.loadPopularVideos();
        await this.loadStories();
    }

    async loadCategories() {
        try {
            const response = await fetch(`${API_URL}/categories/`);
            if (response.ok) {
                this.categories = await response.json();
                this.updateCategoryFilters();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    updateCategoryFilters() {
        const filtersContainer = document.querySelector('.filters');
        if (!filtersContainer) return;

        filtersContainer.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'Все';
        allBtn.onclick = () => this.filterVideosByCategory('all');
        filtersContainer.appendChild(allBtn);

        this.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = category;
            btn.onclick = () => this.filterVideosByCategory(category);
            filtersContainer.appendChild(btn);
        });
    }

    filterVideosByCategory(category) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });

        event.target.classList.add('active');

        const container = document.getElementById('videos-grid');
        if (!container) return;

        if (category === 'all') {
            this.renderVideos(container, this.allVideos);
        } else {
            const filteredVideos = this.allVideos.filter(video => video.category === category);
            this.renderVideos(container, filteredVideos);
        }
    }

    async loadSectionContent(sectionId) {
        switch(sectionId) {
            case 'popular':
                await this.loadPopularVideos();
                break;
            case 'stories':
                await this.loadStories();
                break;
            case 'main':
                await this.loadVideos();
                break;
            case 'my-videos':
                await this.loadMyVideos();
                break;
            case 'music':
                this.filterVideosByCategory('Музыка');
                break;
            case 'gaming':
                this.filterVideosByCategory('Игры');
                break;
            case 'sports':
                this.filterVideosByCategory('Спорт');
                break;
            case 'login':
            case 'register':
                break;
        }
    }

    async loadVideos() {
        try {
            const response = await fetch(`${API_URL}/videos/`);
            if (!response.ok) throw new Error('API не доступен');

            const videos = await response.json();
            this.allVideos = videos.filter(video => !video.is_story);

            // Загружаем количество комментариев для каждого видео
            await this.loadCommentsCountForVideos(this.allVideos);

            const container = document.getElementById('videos-grid');
            if (container) {
                if (this.allVideos.length > 0) {
                    this.renderVideos(container, this.allVideos);
                } else {
                    this.showNoVideosMessage(container);
                }
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showNotification('Ошибка загрузки видео', 'error');
        }
    }

    async loadPopularVideos() {
        try {
            const response = await fetch(`${API_URL}/videos/popular/`);
            const videos = await response.json();
            const popularVideos = videos.filter(video => !video.is_story);

            // Загружаем количество комментариев для популярных видео
            await this.loadCommentsCountForVideos(popularVideos);

            const container = document.getElementById('popular-grid');
            if (container) {
                if (popularVideos.length > 0) {
                    this.renderVideos(container, popularVideos);
                } else {
                    this.showNoVideosMessage(container);
                }
            }
        } catch (error) {
            console.error('Error loading popular videos:', error);
        }
    }

    async loadStories() {
        try {
            const response = await fetch(`${API_URL}/stories/`);
            const stories = await response.json();

            const container = document.getElementById('stories-container');
            if (container) {
                this.renderStories(container, stories);
            }

            const videosContainer = document.getElementById('stories-videos-grid');
            if (videosContainer) {
                if (stories.length > 0) {
                    this.renderVideos(videosContainer, stories);
                } else {
                    this.showNoVideosMessage(videosContainer);
                }
            }
        } catch (error) {
            console.error('Error loading stories:', error);
        }
    }

    async loadMyVideos() {
        try {
            const userId = this.currentUser ? this.currentUser.id : 1;
            const response = await fetch(`${API_URL}/users/${userId}/videos/`);
            const videos = await response.json();
            const myVideos = videos.filter(video => !video.is_story);

            // Загружаем количество комментариев для моих видео
            await this.loadCommentsCountForVideos(myVideos);

            const container = document.getElementById('my-videos-grid');
            if (container) {
                if (myVideos.length > 0) {
                    this.renderVideos(container, myVideos);
                } else {
                    this.showNoVideosMessage(container);
                }
            }
        } catch (error) {
            console.error('Error loading my videos:', error);
        }
    }

    // НОВЫЙ МЕТОД: Загрузка количества комментариев для списка видео
    async loadCommentsCountForVideos(videos) {
        for (const video of videos) {
            try {
                const response = await fetch(`${API_URL}/videos/${video.id}/comments/`);
                if (response.ok) {
                    const comments = await response.json();
                    video.comments_count = comments.length;
                } else {
                    video.comments_count = 0;
                }
            } catch (error) {
                console.error(`Error loading comments count for video ${video.id}:`, error);
                video.comments_count = 0;
            }
        }
    }

    showNoVideosMessage(container) {
        if (container) {
            container.innerHTML = `
                <div class="no-videos" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #aaa;">
                    <i class="fas fa-video-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Видео не найдены</h3>
                    <p>Будьте первым, кто загрузит видео!</p>
                </div>
            `;
        }
    }

    renderVideos(container, videos) {
        if (!container) return;
        container.innerHTML = '';

        videos.forEach(video => {
            const card = this.createVideoCard(video);
            container.appendChild(card);
        });
    }

    renderStories(container, stories) {
        if (!container) return;
        container.innerHTML = '';

        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.className = 'story';
            storyElement.innerHTML = `
                <div class="story-content">
                    <i class="fas fa-play"></i>
                    <p>${story.title}</p>
                </div>
            `;
            storyElement.addEventListener('click', () => {
                this.watchStory(story);
            });
            container.appendChild(storyElement);
        });
    }

    // ОБНОВЛЕННЫЙ МЕТОД: Создание карточки видео с отображением количества комментариев
    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';

        const videoSource = video.file_type === 'file' ?
            `${window.location.origin}${video.video_url}` : video.video_url;

        const isCurrentUserAuthor = true;

        const deleteButton = isCurrentUserAuthor ? `
            <div class="video-card-header">
                <button class="delete-btn-card" onclick="app.deleteVideo(${video.id})" title="Удалить видео">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="video-thumbnail-container">
                ${deleteButton}
                <img src="${video.thumbnail_url}" alt="${video.title}" class="video-thumbnail">
                <div class="video-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${video.description || 'Описание отсутствует'}</p>
                <div class="video-meta">
                    <span class="video-author">${video.author || 'Неизвестен'}</span>
                    <span class="video-category">${video.category || 'Без категории'}</span>
                    <span class="video-duration">${video.duration || '0:00'}</span>
                </div>
                <div class="video-stats">
                    <span><i class="fas fa-eye"></i> ${video.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${video.likes || 0}</span>
                    <span><i class="fas fa-comment"></i> ${video.comments_count || 0}</span>
                </div>
                <div class="video-actions">
                    <button class="action-btn like-btn" onclick="app.likeVideo(${video.id})">
                        <i class="fas fa-heart"></i>
                        Лайк
                    </button>
                    <button class="action-btn comment-btn" onclick="app.showCommentsModal(${video.id}, '${this.escapeHtml(video.title)}')">
                        <i class="fas fa-comment"></i>
                        Комментарии
                    </button>
                    <button class="action-btn watch-btn" onclick="app.watchVideo('${videoSource}')">
                        <i class="fas fa-play"></i>
                        Смотреть
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // МЕТОД: Удаление видео через DELETE
    async deleteVideo(videoId) {
        if (!confirm('Вы уверены, что хотите удалить это видео?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/videos/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                this.showNotification('Видео успешно удалено!', 'success');
                await this.loadAllContent();
                await this.loadMyVideos();
            } else {
                const error = await response.json();
                this.showNotification(`Ошибка удаления: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            this.showNotification('Ошибка соединения при удалении видео', 'error');
        }
    }

    // МЕТОДЫ ДЛЯ КОММЕНТАРИЕВ
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadComments(videoId) {
        try {
            const response = await fetch(`${API_URL}/videos/${videoId}/comments/`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    async showCommentsModal(videoId, videoTitle) {
        const comments = await this.loadComments(videoId);

        const modal = this.createCommentsModal(videoId, videoTitle, comments);
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createCommentsModal(videoId, videoTitle, comments) {
        const modal = document.createElement('div');
        modal.className = 'comments-modal';
        modal.innerHTML = `
            <div class="comments-modal-overlay"></div>
            <div class="comments-modal-content">
                <div class="comments-modal-header">
                    <h3>Комментарии к видео: "${videoTitle}"</h3>
                    <button class="close-btn" onclick="this.closest('.comments-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="comments-section">
                    <div class="add-comment-form">
                        <textarea placeholder="Добавьте комментарий..." class="comment-textarea" id="commentTextarea-${videoId}"></textarea>
                        <button class="submit-comment-btn" onclick="app.submitComment(${videoId})">
                            <i class="fas fa-paper-plane"></i>
                            Отправить
                        </button>
                    </div>
                    
                    <div class="comments-list" id="commentsList-${videoId}">
                        ${this.renderCommentsList(comments)}
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.comments-modal-overlay').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    renderCommentsList(comments) {
        if (!comments || comments.length === 0) {
            return `
                <div class="no-comments">
                    <i class="fas fa-comments"></i>
                    <p>Пока нет комментариев. Будьте первым!</p>
                </div>
            `;
        }

        return comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const user = comment.user || { username: 'Неизвестный пользователь' };
        const date = new Date(comment.created_at).toLocaleDateString('ru-RU');

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${user.username}</span>
                        <span class="comment-date">${date}</span>
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                    <div class="comment-actions">
                        <button class="comment-action-btn like-btn ${comment.user_liked ? 'liked' : ''}" 
                                onclick="app.likeComment(${comment.id})">
                            <i class="fas fa-heart"></i>
                            <span>${comment.likes_count}</span>
                        </button>
                        <button class="comment-action-btn reply-btn" 
                                onclick="app.showReplyForm(${comment.id})">
                            <i class="fas fa-reply"></i>
                            Ответить
                        </button>
                        ${this.currentUser && this.currentUser.id === comment.user_id ? `
                            <button class="comment-action-btn delete-btn" 
                                    onclick="app.deleteComment(${comment.id})">
                                <i class="fas fa-trash"></i>
                                Удалить
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                        <textarea placeholder="Напишите ответ..." class="reply-textarea" id="replyTextarea-${comment.id}"></textarea>
                        <div class="reply-actions">
                            <button class="cancel-reply-btn" onclick="app.hideReplyForm(${comment.id})">
                                Отмена
                            </button>
                            <button class="submit-reply-btn" onclick="app.submitReply(${comment.id}, ${comment.video_id})">
                                Отправить ответ
                            </button>
                        </div>
                    </div>
                    
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.replies.map(reply => this.renderComment(reply)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async submitComment(videoId) {
        const textarea = document.getElementById(`commentTextarea-${videoId}`);
        const text = textarea.value.trim();

        if (!text) {
            this.showNotification('Введите текст комментария', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('Для комментирования необходимо авторизоваться', 'error');
            document.querySelector('.comments-modal')?.remove();
            this.showSection('login');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('video_id', videoId);

            const response = await fetch(`${API_URL}/comments/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.showNotification('Комментарий добавлен!', 'success');
                textarea.value = '';
                await this.refreshComments(videoId);

                // Обновляем счетчик комментариев в карточке видео
                await this.updateVideoCommentsCount(videoId);
            } else {
                const error = await response.json();
                this.showNotification(`Ошибка: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showNotification('Ошибка отправки комментария', 'error');
        }
    }

    async submitReply(commentId, videoId) {
        const textarea = document.getElementById(`replyTextarea-${commentId}`);
        const text = textarea.value.trim();

        if (!text) {
            this.showNotification('Введите текст ответа', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('Для ответа необходимо авторизоваться', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('video_id', videoId);
            formData.append('parent_id', commentId);

            const response = await fetch(`${API_URL}/comments/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.showNotification('Ответ добавлен!', 'success');
                textarea.value = '';
                this.hideReplyForm(commentId);
                await this.refreshComments(videoId);

                // Обновляем счетчик комментариев в карточке видео
                await this.updateVideoCommentsCount(videoId);
            } else {
                const error = await response.json();
                this.showNotification(`Ошибка: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            this.showNotification('Ошибка отправки ответа', 'error');
        }
    }

    async likeComment(commentId) {
        if (!this.currentUser) {
            this.showNotification('Для лайка необходимо авторизоваться', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/comments/${commentId}/like/`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(result.liked ? 'Лайк добавлен!' : 'Лайк удален', 'success');

                const likeBtn = document.querySelector(`[onclick="app.likeComment(${commentId})"]`);
                if (likeBtn) {
                    const likeCount = likeBtn.querySelector('span');

                    if (result.liked) {
                        likeBtn.classList.add('liked');
                        likeCount.textContent = parseInt(likeCount.textContent) + 1;
                    } else {
                        likeBtn.classList.remove('liked');
                        likeCount.textContent = parseInt(likeCount.textContent) - 1;
                    }
                }
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            this.showNotification('Ошибка лайка комментария', 'error');
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Комментарий удален!', 'success');

                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (commentElement) {
                    commentElement.remove();
                }

                // Обновляем счетчик комментариев в карточке видео
                const videoId = commentElement ? commentElement.querySelector('.comment-content')?.dataset?.videoId : null;
                if (videoId) {
                    await this.updateVideoCommentsCount(videoId);
                }
            } else {
                const error = await response.json();
                this.showNotification(`Ошибка: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.showNotification('Ошибка удаления комментария', 'error');
        }
    }

    // НОВЫЙ МЕТОД: Обновление счетчика комментариев в карточке видео
    async updateVideoCommentsCount(videoId) {
        try {
            const response = await fetch(`${API_URL}/videos/${videoId}/comments/`);
            if (response.ok) {
                const comments = await response.json();
                const commentsCount = comments.length;

                // Находим все карточки видео с этим ID и обновляем счетчик
                const videoCards = document.querySelectorAll('.video-card');
                videoCards.forEach(card => {
                    const videoTitle = card.querySelector('.video-title')?.textContent;
                    if (videoTitle && card.innerHTML.includes(`onclick="app.showCommentsModal(${videoId},`)) {
                        const commentsSpan = card.querySelector('.video-stats span:last-child');
                        if (commentsSpan) {
                            commentsSpan.innerHTML = `<i class="fas fa-comment"></i> ${commentsCount}`;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating video comments count:', error);
        }
    }

    showReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
            replyForm.style.display = 'block';
        }
    }

    hideReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
            replyForm.style.display = 'none';
            const textarea = replyForm.querySelector('.reply-textarea');
            if (textarea) textarea.value = '';
        }
    }

    async refreshComments(videoId) {
        const commentsList = document.getElementById(`commentsList-${videoId}`);
        if (!commentsList) return;

        const comments = await this.loadComments(videoId);
        commentsList.innerHTML = this.renderCommentsList(comments);
    }

    // МЕТОД: Настройка обработчиков событий
    setupEventListeners() {
        console.log('Setting up event listeners...');

        this.ensureElements();

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        } else {
            console.error('Register form not found');
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            console.error('Login form not found');
        }

        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }

        const uploadStoryForm = document.getElementById('uploadStoryForm');
        if (uploadStoryForm) {
            uploadStoryForm.addEventListener('submit', (e) => this.handleStoryUpload(e));
        }

        const searchInput = document.getElementById('mainSearchInput');
        const searchBtn = document.getElementById('mainSearchBtn');

        if (searchInput && searchBtn) {
            const performSearch = () => {
                const query = searchInput.value.trim();
                if (query) {
                    this.handleSearch(query);
                } else {
                    this.showNotification('Введите поисковый запрос', 'error');
                }
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        this.setupAdditionalEventListeners();
    }

    ensureElements() {
        const requiredElements = [
            'headerLoginBtn', 'headerRegisterBtn', 'headerLogoutBtn',
            'loginForm', 'registerForm'
        ];

        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Required element not found: #${id}`);
            }
        });
    }

    setupAdditionalEventListeners() {
        const uploadTrigger = document.getElementById('uploadTriggerBtn');
        if (uploadTrigger) {
            uploadTrigger.addEventListener('click', () => {
                const uploadSection = document.getElementById('uploadSection');
                if (uploadSection) {
                    uploadSection.style.display = 'block';
                }
            });
        }

        const uploadStoryBtn = document.getElementById('uploadStoryBtn');
        if (uploadStoryBtn) {
            uploadStoryBtn.addEventListener('click', () => {
                const uploadStorySection = document.getElementById('uploadStorySection');
                if (uploadStorySection) {
                    uploadStorySection.style.display = 'block';
                }
            });
        }

        const uploadCancelBtn = document.getElementById('uploadCancelBtn');
        if (uploadCancelBtn) {
            uploadCancelBtn.addEventListener('click', () => {
                const uploadSection = document.getElementById('uploadSection');
                const uploadForm = document.getElementById('uploadForm');
                const thumbnailPreview = document.getElementById('thumbnailPreview');

                if (uploadSection) uploadSection.style.display = 'none';
                if (uploadForm) uploadForm.reset();
                if (thumbnailPreview) {
                    thumbnailPreview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Загрузите превью видео</p>
                        <input type="file" accept="image/*" class="file-input" id="thumbnailInput">
                    `;
                }
            });
        }

        const storyCancelBtn = document.getElementById('storyCancelBtn');
        if (storyCancelBtn) {
            storyCancelBtn.addEventListener('click', () => {
                const uploadStorySection = document.getElementById('uploadStorySection');
                const uploadStoryForm = document.getElementById('uploadStoryForm');
                const storyThumbnailPreview = document.getElementById('storyThumbnailPreview');

                if (uploadStorySection) uploadStorySection.style.display = 'none';
                if (uploadStoryForm) uploadStoryForm.reset();
                if (storyThumbnailPreview) {
                    storyThumbnailPreview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Загрузите превью сторис</p>
                        <input type="file" accept="image/*" class="file-input" id="storyThumbnailInput">
                    `;
                }
            });
        }

        const ctaButton = document.getElementById('mainCtaButton');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.showSection('popular');
            });
        }

        const headerUploadBtn = document.getElementById('headerUploadBtn');
        if (headerUploadBtn) {
            headerUploadBtn.addEventListener('click', () => {
                this.showSection('my-videos');
                const uploadSection = document.getElementById('uploadSection');
                if (uploadSection) {
                    uploadSection.style.display = 'block';
                }
            });
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('Starting registration...');

        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username') || document.getElementById('regUsername')?.value,
            email: formData.get('email') || document.getElementById('regEmail')?.value,
            password: formData.get('password') || document.getElementById('regPassword')?.value
        };

        if (!userData.username || !userData.email || !userData.password) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('Register response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                this.currentUser = result.user || result;

                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                this.showNotification('Регистрация успешна! Добро пожаловать!', 'success');

                const registerForm = document.getElementById('registerForm');
                if (registerForm) registerForm.reset();

                this.updateUserInterface();
                this.showSection('main');

                await this.loadAllContent();
            } else {
                let errorMessage = 'Ошибка регистрации';
                try {
                    const errorData = await response.json();
                    console.log('Register error:', errorData);
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
                } catch (parseError) {
                    errorMessage = `Ошибка ${response.status}`;
                }
                this.showNotification(`Ошибка регистрации: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('Starting login...');

        const formData = new FormData(e.target);
        const loginData = {
            username: formData.get('username') || document.getElementById('loginUsername')?.value,
            password: formData.get('password') || document.getElementById('loginPassword')?.value
        };

        if (!loginData.username || !loginData.password) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        try {
            let response = await fetch(`${API_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            console.log('Login response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                this.currentUser = result.user || result;

                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                this.showNotification(`Добро пожаловать, ${this.currentUser.username}!`, 'success');

                const loginForm = document.getElementById('loginForm');
                if (loginForm) loginForm.reset();

                this.updateUserInterface();
                this.showSection('main');

                await this.loadAllContent();
            } else {
                let errorMessage = 'Ошибка входа';
                try {
                    const errorData = await response.json();
                    console.log('Login error:', errorData);
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
                } catch (parseError) {
                    errorMessage = `Ошибка ${response.status}`;
                }
                this.showNotification(`Ошибка входа: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async handleLogout() {
        try {
            await fetch(`${API_URL}/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showNotification('Вы успешно вышли из системы', 'success');
            this.updateUserInterface();
            this.showSection('main');
        }
    }

    async handleUpload(e) {
        e.preventDefault();
        console.log('Starting video upload...');

        if (!this.currentUser) {
            this.showNotification('Для загрузки видео необходимо авторизоваться', 'error');
            this.showSection('login');
            return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('uploadVideoTitle').value);
        formData.append('description', document.getElementById('uploadVideoDescription').value);
        formData.append('category', document.getElementById('uploadVideoCategory').value);
        formData.append('author_id', this.currentUser.id);

        const videoFile = document.getElementById('uploadVideoFile');
        const videoUrl = document.getElementById('videoUrl');
        const thumbnailFile = document.getElementById('thumbnailInput');

        if (!videoFile.files[0] && !videoUrl.value) {
            this.showNotification('Укажите видео файл или ссылку на видео', 'error');
            return;
        }

        if (videoFile.files[0]) {
            formData.append('video_file', videoFile.files[0]);
        } else {
            formData.append('video_url', videoUrl.value);
        }

        if (thumbnailFile.files[0]) {
            formData.append('thumbnail_file', thumbnailFile.files[0]);
        } else {
            formData.append('thumbnail_url', `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`);
        }

        try {
            const response = await fetch(`${API_URL}/videos/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const video = await response.json();
                this.showNotification('Видео успешно загружено!', 'success');

                const uploadForm = document.getElementById('uploadForm');
                if (uploadForm) uploadForm.reset();

                const thumbnailPreview = document.getElementById('thumbnailPreview');
                if (thumbnailPreview) {
                    thumbnailPreview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Загрузите превью видео</p>
                        <input type="file" accept="image/*" class="file-input" id="thumbnailInput">
                    `;
                }

                const uploadSection = document.getElementById('uploadSection');
                if (uploadSection) uploadSection.style.display = 'none';

                await this.loadVideos();
                await this.loadMyVideos();

            } else {
                const error = await response.json();
                this.showNotification(`Ошибка загрузки: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Ошибка загрузки видео', 'error');
        }
    }

    async handleStoryUpload(e) {
        e.preventDefault();
        console.log('Starting story upload...');

        if (!this.currentUser) {
            this.showNotification('Для загрузки сторис необходимо авторизоваться', 'error');
            this.showSection('login');
            return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('storyTitle').value);
        formData.append('description', document.getElementById('storyDescription').value);
        formData.append('author_id', this.currentUser.id);

        const videoFile = document.getElementById('storyVideoFile');
        const videoUrl = document.getElementById('storyVideoUrl');
        const thumbnailFile = document.getElementById('storyThumbnailInput');

        if (!videoFile.files[0] && !videoUrl.value) {
            this.showNotification('Укажите видео файл или ссылку на видео', 'error');
            return;
        }

        if (videoFile.files[0]) {
            formData.append('video_file', videoFile.files[0]);
        } else {
            formData.append('video_url', videoUrl.value);
        }

        if (thumbnailFile.files[0]) {
            formData.append('thumbnail_file', thumbnailFile.files[0]);
        } else {
            formData.append('thumbnail_url', `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`);
        }

        try {
            const response = await fetch(`${API_URL}/stories/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const story = await response.json();
                this.showNotification('Сторис успешно загружен!', 'success');

                const uploadStoryForm = document.getElementById('uploadStoryForm');
                if (uploadStoryForm) uploadStoryForm.reset();

                const storyThumbnailPreview = document.getElementById('storyThumbnailPreview');
                if (storyThumbnailPreview) {
                    storyThumbnailPreview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Загрузите превью сторис</p>
                        <input type="file" accept="image/*" class="file-input" id="storyThumbnailInput">
                    `;
                }

                const uploadStorySection = document.getElementById('uploadStorySection');
                if (uploadStorySection) uploadStorySection.style.display = 'none';

                await this.loadStories();

            } else {
                const error = await response.json();
                this.showNotification(`Ошибка загрузки сторис: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Story upload error:', error);
            this.showNotification('Ошибка загрузки сторис', 'error');
        }
    }

    async likeVideo(videoId) {
        try {
            const response = await fetch(`${API_URL}/videos/${videoId}/like/`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showNotification('Лайк добавлен!', 'success');
                this.loadAllContent();
            } else {
                const error = await response.json();
                this.showNotification(`Ошибка: ${error.detail}`, 'error');
            }
        } catch (error) {
            console.error('Error liking video:', error);
            this.showNotification('Ошибка соединения', 'error');
        }
    }

    watchVideo(videoUrl) {
        window.open(videoUrl, '_blank');
        this.showNotification('Открываем видео...', 'info');
    }

    watchStory(story) {
        const videoSource = story.file_type === 'file' ?
            `${window.location.origin}${story.video_url}` : story.video_url;
        window.open(videoSource, '_blank');
        this.showNotification('Смотрим сторис...', 'info');
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.showNotification('Введите поисковый запрос', 'error');
            return;
        }

        this.showSection('main');

        const searchTerm = query.toLowerCase();
        const filteredVideos = this.allVideos.filter(video =>
            video.title.toLowerCase().includes(searchTerm) ||
            (video.description && video.description.toLowerCase().includes(searchTerm)) ||
            (video.author && (
                (video.author.username && video.author.username.toLowerCase().includes(searchTerm)) ||
                (typeof video.author === 'string' && video.author.toLowerCase().includes(searchTerm))
            ))
        );

        const container = document.getElementById('videos-grid');

        if (container) {
            if (filteredVideos.length > 0) {
                this.renderVideos(container, filteredVideos);
                this.showNotification(`Найдено ${filteredVideos.length} видео по запросу: "${query}"`, 'success');
            } else {
                this.showNoVideosMessage(container);
                this.showNotification(`По запросу "${query}" ничего не найдено`, 'error');
            }
        }
    }

    updateUserInterface() {
        const headerLoginBtn = document.getElementById('headerLoginBtn');
        const headerRegisterBtn = document.getElementById('headerRegisterBtn');
        const headerLogoutBtn = document.getElementById('headerLogoutBtn');
        const headerUploadBtn = document.getElementById('headerUploadBtn');
        const uploadStoryBtn = document.getElementById('uploadStoryBtn');
        const userWelcome = document.getElementById('userWelcome');

        if (this.currentUser) {
            if (headerLoginBtn) headerLoginBtn.style.display = 'none';
            if (headerRegisterBtn) headerRegisterBtn.style.display = 'none';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'flex';
            if (headerUploadBtn) headerUploadBtn.style.display = 'flex';
            if (uploadStoryBtn) uploadStoryBtn.style.display = 'flex';
            if (userWelcome) {
                userWelcome.textContent = `Привет, ${this.currentUser.username}!`;
                userWelcome.style.display = 'block';
            }
        } else {
            if (headerLoginBtn) headerLoginBtn.style.display = 'flex';
            if (headerRegisterBtn) headerRegisterBtn.style.display = 'flex';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
            if (headerUploadBtn) headerUploadBtn.style.display = 'none';
            if (uploadStoryBtn) uploadStoryBtn.style.display = 'none';
            if (userWelcome) userWelcome.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 2rem',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            backgroundColor: type === 'success' ? '#00c853' :
                           type === 'error' ? '#ff0000' :
                           type === 'info' ? '#2196f3' : '#666',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing VideoHubApp...');
    window.app = new VideoHubApp();
});

// Глобальный обработчик ошибок
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});