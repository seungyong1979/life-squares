/**
 * UI 컨트롤러 모듈
 * 사용자 인터페이스 관리 및 이벤트 처리
 */

class UIController {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentYear = new Date().getFullYear();
        this.currentScreen = 'setup';
        this.currentMonth = null; // 주별 화면에서 사용
        this.currentImportance = 0; // 현재 선택된 중요도
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
    }

    // 텍스트 길이 제한 함수
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // 화면별 적절한 텍스트 길이 제한 (화면 크기에 따라 조정)
    getTextLimits() {
        const isMobile = window.innerWidth <= 480;
        const isTablet = window.innerWidth <= 768;
        
        if (isMobile) {
            return {
                month: 25,      // 월별 화면
                week: 20,       // 주별 화면  
                day: 15,        // 일별 화면
                importantItem: 12  // 중요 아이템 텍스트
            };
        } else if (isTablet) {
            return {
                month: 35,      // 월별 화면
                week: 30,       // 주별 화면  
                day: 20,        // 일별 화면
                importantItem: 15  // 중요 아이템 텍스트
            };
        } else {
            return {
                month: 50,      // 월별 화면
                week: 40,       // 주별 화면  
                day: 30,        // 일별 화면
                importantItem: 20  // 중요 아이템 텍스트
            };
        }
    }

    // DOM 요소 초기화
    initializeElements() {
        // 화면 요소들
        this.setupScreen = document.getElementById('setup-screen');
        this.mainScreen = document.getElementById('main-screen');
        this.weekScreen = document.getElementById('week-screen');
        this.dayScreen = document.getElementById('day-screen');
        
        // 설정 화면 요소들
        this.birthDateInput = document.getElementById('birth-date');
        this.lifeExpectancyInput = document.getElementById('life-expectancy');
        this.startBtn = document.getElementById('start-btn');
        this.setupTitle = document.getElementById('setup-title');
        this.setupSubtitle = document.getElementById('setup-subtitle');
        
        // 메인 화면 요소들
        this.yearSelector = document.getElementById('year-selector');
        this.prevYearBtn = document.getElementById('prev-year');
        this.nextYearBtn = document.getElementById('next-year');
        this.currentYearDisplay = document.getElementById('current-year-display');
        this.ageDisplay = document.getElementById('age-display');
        this.monthsGrid = document.getElementById('months-grid');
        
        // 주별 화면 요소들
        this.backToMonthBtn = document.getElementById('back-to-month');
        this.weekTitle = document.getElementById('week-title');
        this.weeksGrid = document.getElementById('weeks-grid');
        
        // 일별 화면 요소들
        this.backToWeekBtn = document.getElementById('back-to-week');
        this.dayTitle = document.getElementById('day-title');
        this.daysGrid = document.getElementById('days-grid');
        
        // 컨트롤 버튼들
        this.settingsBtn = document.getElementById('settings-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.resetBtn = document.getElementById('reset-btn');
        
        // 모달 요소들
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalTextarea = document.getElementById('modal-textarea');
        this.importanceSection = document.getElementById('importance-section');
        this.stars = document.querySelectorAll('.star');
        this.ratingText = document.getElementById('rating-text');
        this.saveBtn = document.getElementById('save-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.closeModalBtns = document.querySelectorAll('.close-btn');
        
        // 내보내기 모달 요소들
        this.exportModal = document.getElementById('export-modal');
        this.exportData = document.getElementById('export-data');
        this.copyDataBtn = document.getElementById('copy-data-btn');
        this.closeExportBtn = document.getElementById('close-export-btn');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 설정 화면 이벤트
        this.startBtn.addEventListener('click', () => this.handleSetupComplete());
        this.birthDateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSetupComplete();
        });
        this.lifeExpectancyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSetupComplete();
        });

        // 동적 교육 기관 추가/삭제 이벤트
        this.setupDynamicEducationEvents();

        // 연도 네비게이션 이벤트
        this.prevYearBtn.addEventListener('click', () => this.changeYear(-1));
        this.nextYearBtn.addEventListener('click', () => this.changeYear(1));
        this.yearSelector.addEventListener('change', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.renderMainScreen();
        });

        // 주별 화면 이벤트
        this.backToMonthBtn.addEventListener('click', () => this.showMainScreen());

        // 일별 화면 이벤트
        this.backToWeekBtn.addEventListener('click', () => {
            if (this.currentMonth) {
                this.showWeekScreen(this.currentMonth.year, this.currentMonth.month);
            }
        });

        // 컨트롤 버튼 이벤트
        this.settingsBtn.addEventListener('click', () => this.showSettingsScreen());
        this.exportBtn.addEventListener('click', () => this.showExportModal());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.resetBtn.addEventListener('click', () => this.handleReset());

        // 모달 이벤트
        this.saveBtn.addEventListener('click', () => this.handleSave());
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // 별점 이벤트
        this.stars.forEach(star => {
            star.addEventListener('click', () => this.setRating(parseInt(star.dataset.rating)));
            star.addEventListener('mouseenter', () => this.highlightStars(parseInt(star.dataset.rating)));
            star.addEventListener('mouseleave', () => this.highlightStars(this.currentImportance));
        });

        // 내보내기 모달 이벤트
        this.copyDataBtn.addEventListener('click', () => this.copyExportData());
        this.closeExportBtn.addEventListener('click', () => this.hideExportModal());

        // 모달 배경 클릭 시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        this.exportModal.addEventListener('click', (e) => {
            if (e.target === this.exportModal) this.hideExportModal();
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideExportModal();
            }
        });
    }

    // 초기 화면 결정
    initializeScreen() {
        const userInfo = this.dataManager.getUserInfo();
        if (userInfo.setupCompleted) {
            this.showMainScreen();
        } else {
            // 초기 설정 시 원래 제목으로 설정
            this.setupTitle.textContent = '삶을 정리하는 네모들';
            this.setupSubtitle.textContent = '당신의 삶을 시각적으로 정리하고 계획해보세요';
            this.showSetupScreen();
        }
    }

    // 설정 화면 표시
    showSetupScreen() {
        this.currentScreen = 'setup';
        this.setupScreen.classList.remove('hidden');
        this.mainScreen.classList.add('hidden');
        this.weekScreen.classList.add('hidden');
        this.dayScreen.classList.add('hidden');
        this.birthDateInput.focus();
    }

    // 설정 변경을 위한 설정 화면 표시
    showSettingsScreen() {
        // 제목 변경
        this.setupTitle.textContent = '설정 변경';
        this.setupSubtitle.textContent = '기본 정보와 교육 기간을 수정할 수 있습니다';
        
        this.loadExistingData();
        this.showSetupScreen();
    }

    // 기존 데이터를 설정 화면에 불러오기
    loadExistingData() {
        const userInfo = this.dataManager.getUserInfo();
        const educationPeriods = this.dataManager.getEducationPeriods();

        // 기본 정보 불러오기
        if (userInfo.birthDate) {
            this.birthDateInput.value = userInfo.birthDate;
        }
        if (userInfo.lifeExpectancy) {
            this.lifeExpectancyInput.value = userInfo.lifeExpectancy;
        }

        // 단일 교육 기간 불러오기
        const singleTypes = ['daycare', 'kindergarten', 'elementary', 'middle', 'high'];
        singleTypes.forEach(type => {
            const period = educationPeriods[type];
            if (period) {
                const startInput = document.getElementById(`${type}-start`);
                const endInput = document.getElementById(`${type}-end`);
                
                if (startInput && period.start) {
                    startInput.value = period.start;
                }
                if (endInput && period.end) {
                    endInput.value = period.end;
                }
            }
        });

        // 대학교 데이터 불러오기
        this.loadUniversityData(educationPeriods.university);
        
        // 기타 기관 데이터 불러오기  
        this.loadOtherData(educationPeriods.other);
    }

    // 대학교 데이터 불러오기
    loadUniversityData(universityData) {
        const container = document.getElementById('university-container');
        if (!container || !universityData || universityData.length === 0) return;

        // 기존 항목들 제거 (첫 번째 제외)
        const existingItems = container.querySelectorAll('.education-item');
        existingItems.forEach((item, index) => {
            if (index > 0) {
                item.remove();
            }
        });

        universityData.forEach((university, index) => {
            if (index === 0) {
                // 첫 번째 항목은 기존 HTML을 사용
                const startInput = document.getElementById('university-0-start');
                const endInput = document.getElementById('university-0-end');
                const nameInput = document.getElementById('university-0-name');
                
                if (startInput && university.start) startInput.value = university.start;
                if (endInput && university.end) endInput.value = university.end;
                if (nameInput && university.name) nameInput.value = university.name;

                // 휴학 기간 불러오기
                this.loadLeaveData(0, university.leavePeriods);
            } else {
                // 추가 항목들 생성
                this.addEducationItem('university');
                
                // 생성된 항목에 데이터 설정
                const startInput = document.getElementById(`university-${index}-start`);
                const endInput = document.getElementById(`university-${index}-end`);
                const nameInput = document.getElementById(`university-${index}-name`);
                
                if (startInput && university.start) startInput.value = university.start;
                if (endInput && university.end) endInput.value = university.end;
                if (nameInput && university.name) nameInput.value = university.name;

                // 휴학 기간 불러오기
                this.loadLeaveData(index, university.leavePeriods);
            }
        });
    }

    // 기타 기관 데이터 불러오기
    loadOtherData(otherData) {
        const container = document.getElementById('other-container');
        if (!container || !otherData || otherData.length === 0) return;

        // 기존 항목들 제거 (첫 번째 제외)
        const existingItems = container.querySelectorAll('.education-item');
        existingItems.forEach((item, index) => {
            if (index > 0) {
                item.remove();
            }
        });

        otherData.forEach((other, index) => {
            if (index === 0) {
                // 첫 번째 항목은 기존 HTML을 사용
                const startInput = document.getElementById('other-0-start');
                const endInput = document.getElementById('other-0-end');
                const nameInput = document.getElementById('other-0-name');
                
                if (startInput && other.start) startInput.value = other.start;
                if (endInput && other.end) endInput.value = other.end;
                if (nameInput && other.name) nameInput.value = other.name;
            } else {
                // 추가 항목들 생성
                this.addEducationItem('other');
                
                // 생성된 항목에 데이터 설정
                const startInput = document.getElementById(`other-${index}-start`);
                const endInput = document.getElementById(`other-${index}-end`);
                const nameInput = document.getElementById(`other-${index}-name`);
                
                if (startInput && other.start) startInput.value = other.start;
                if (endInput && other.end) endInput.value = other.end;
                if (nameInput && other.name) nameInput.value = other.name;
            }
        });
    }

    // 휴학 기간 데이터 불러오기
    loadLeaveData(universityIndex, leavePeriods) {
        if (!leavePeriods || leavePeriods.length === 0) return;

        leavePeriods.forEach((leavePeriod) => {
            this.addLeaveItem(universityIndex);
            
            // 방금 추가된 휴학 항목의 인덱스 구하기
            const container = document.querySelector(`[data-university-index="${universityIndex}"].leave-container`);
            const leaveItems = container.querySelectorAll('.leave-item');
            const leaveIndex = leaveItems.length - 1;
            
            // 데이터 설정
            const startInput = document.getElementById(`leave-${universityIndex}-${leaveIndex}-start`);
            const endInput = document.getElementById(`leave-${universityIndex}-${leaveIndex}-end`);
            
            if (startInput && leavePeriod.start) startInput.value = leavePeriod.start;
            if (endInput && leavePeriod.end) endInput.value = leavePeriod.end;
        });
    }

    // 메인 화면 표시
    showMainScreen() {
        this.currentScreen = 'main';
        this.setupScreen.classList.add('hidden');
        this.mainScreen.classList.remove('hidden');
        this.weekScreen.classList.add('hidden');
        this.dayScreen.classList.add('hidden');
        this.renderMainScreen();
    }

    // 주별 화면 표시
    showWeekScreen(year, month) {
        this.currentScreen = 'week';
        this.currentMonth = { year, month };
        this.setupScreen.classList.add('hidden');
        this.mainScreen.classList.add('hidden');
        this.weekScreen.classList.remove('hidden');
        this.dayScreen.classList.add('hidden');
        this.renderWeekScreen(year, month);
    }

    // 일별 화면 표시
    showDayScreen(year, month, week) {
        this.currentScreen = 'day';
        this.currentWeek = { year, month, week };
        this.setupScreen.classList.add('hidden');
        this.mainScreen.classList.add('hidden');
        this.weekScreen.classList.add('hidden');
        this.dayScreen.classList.remove('hidden');
        this.renderDayScreen(year, month, week);
    }

    // 설정 완료 처리
    handleSetupComplete() {
        const birthDate = this.birthDateInput.value.trim();
        const lifeExpectancy = this.lifeExpectancyInput.value.trim();

        if (!birthDate) {
            alert('생년월일을 입력해주세요');
            this.birthDateInput.focus();
            return;
        }

        const birth = new Date(birthDate);
        const today = new Date();
        
        if (birth > today) {
            alert('미래 날짜는 입력할 수 없습니다');
            this.birthDateInput.focus();
            return;
        }

        if (!lifeExpectancy || lifeExpectancy < 50) {
            alert('올바른 기대 수명을 입력해주세요 (50세 이상)');
            this.lifeExpectancyInput.focus();
            return;
        }

        // 교육 기간 데이터 수집
        const educationPeriods = this.collectEducationPeriods();

        if (this.dataManager.setUserInfo(birthDate, lifeExpectancy, educationPeriods)) {
            this.currentYear = new Date().getFullYear();
            
            // 제목을 원래대로 되돌리기
            this.setupTitle.textContent = '삶을 정리하는 네모들';
            this.setupSubtitle.textContent = '당신의 삶을 시각적으로 정리하고 계획해보세요';
            
            this.showMainScreen();
        } else {
            alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
        }
    }

    // 동적 교육 기관 이벤트 설정
    setupDynamicEducationEvents() {
        // 대학교 추가 버튼
        const addUniversityBtn = document.getElementById('add-university-btn');
        if (addUniversityBtn) {
            addUniversityBtn.addEventListener('click', () => this.addEducationItem('university'));
        }

        // 기타 기관 추가 버튼
        const addOtherBtn = document.getElementById('add-other-btn');
        if (addOtherBtn) {
            addOtherBtn.addEventListener('click', () => this.addEducationItem('other'));
        }

        // 기존 제거 버튼들에 이벤트 바인딩
        this.bindRemoveButtons();
        
        // 휴학 관련 이벤트 바인딩
        this.bindLeaveEvents();
    }

    // 교육 기관 아이템 추가
    addEducationItem(type) {
        const container = document.getElementById(`${type}-container`);
        if (!container) return;

        const existingItems = container.querySelectorAll('.education-item');
        const newIndex = existingItems.length;

        // 자동 시작 날짜 설정
        const lastEndDate = this.dataManager.getLastEndDateBeforeType(type);
        const autoStartDate = lastEndDate ? this.dataManager.getNextMonthDateString(lastEndDate) : '';

        let itemHtml = `
            <div class="education-item" data-type="${type}" data-index="${newIndex}">
                <div class="period-inputs">
                    <input type="month" id="${type}-${newIndex}-start" class="period-input" 
                           data-type="${type}" data-index="${newIndex}" data-field="start" value="${autoStartDate}">
                    <span>~</span>
                    <input type="month" id="${type}-${newIndex}-end" class="period-input" 
                           data-type="${type}" data-index="${newIndex}" data-field="end">
                    <button type="button" class="remove-btn" data-type="${type}" data-index="${newIndex}">×</button>
                </div>
                <input type="text" id="${type}-${newIndex}-name" class="other-name-input" 
                       data-type="${type}" data-index="${newIndex}" data-field="name" 
                       placeholder="${type === 'university' ? '대학교명 (선택사항)' : '기관명 (필수)'}">`;

        // 대학교인 경우 휴학 기간 섹션 추가
        if (type === 'university') {
            itemHtml += `
                <div class="leave-section">
                    <div class="leave-header">
                        <label class="leave-label">휴학 기간</label>
                        <button type="button" class="add-leave-btn" data-university-index="${newIndex}">+ 휴학 추가</button>
                    </div>
                    <div class="leave-container" data-university-index="${newIndex}">
                        <!-- 휴학 기간들이 동적으로 추가됩니다 -->
                    </div>
                </div>`;
        }

        itemHtml += `
            </div>
        `;

        container.insertAdjacentHTML('beforeend', itemHtml);
        this.bindRemoveButtons();
        this.bindLeaveEvents();
    }

    // 교육 기관 아이템 제거
    removeEducationItem(type, index) {
        const container = document.getElementById(`${type}-container`);
        if (!container) return;

        const item = container.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        if (item) {
            item.remove();
            this.reindexEducationItems(type);
        }
    }

    // 교육 기관 아이템 인덱스 재정렬
    reindexEducationItems(type) {
        const container = document.getElementById(`${type}-container`);
        if (!container) return;

        const items = container.querySelectorAll('.education-item');
        items.forEach((item, newIndex) => {
            item.setAttribute('data-index', newIndex);
            
            const inputs = item.querySelectorAll('input, button');
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                const oldId = input.id;
                
                if (field) {
                    input.id = `${type}-${newIndex}-${field}`;
                    input.setAttribute('data-index', newIndex);
                } else if (input.classList.contains('remove-btn')) {
                    input.setAttribute('data-index', newIndex);
                }
            });
        });
    }

    // 제거 버튼 이벤트 바인딩
    bindRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(btn => {
            // 기존 이벤트 리스너 제거 방지
            btn.replaceWith(btn.cloneNode(true));
        });

        // 새로운 이벤트 리스너 추가
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeEducationItem(type, index);
            });
        });
    }

    // 휴학 관련 이벤트 바인딩
    bindLeaveEvents() {
        // 휴학 추가 버튼
        document.querySelectorAll('.add-leave-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll('.add-leave-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const universityIndex = parseInt(e.target.getAttribute('data-university-index'));
                this.addLeaveItem(universityIndex);
            });
        });

        // 휴학 삭제 버튼
        document.querySelectorAll('.remove-leave-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll('.remove-leave-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const universityIndex = parseInt(e.target.getAttribute('data-university-index'));
                const leaveIndex = parseInt(e.target.getAttribute('data-leave-index'));
                this.removeLeaveItem(universityIndex, leaveIndex);
            });
        });
    }

    // 휴학 기간 추가
    addLeaveItem(universityIndex) {
        const container = document.querySelector(`[data-university-index="${universityIndex}"].leave-container`);
        if (!container) return;

        const existingItems = container.querySelectorAll('.leave-item');
        const newLeaveIndex = existingItems.length;

        const leaveHtml = `
            <div class="leave-item" data-university-index="${universityIndex}" data-leave-index="${newLeaveIndex}">
                <input type="month" class="leave-period-input" 
                       id="leave-${universityIndex}-${newLeaveIndex}-start"
                       data-university-index="${universityIndex}" data-leave-index="${newLeaveIndex}" data-field="start">
                <span>~</span>
                <input type="month" class="leave-period-input" 
                       id="leave-${universityIndex}-${newLeaveIndex}-end"
                       data-university-index="${universityIndex}" data-leave-index="${newLeaveIndex}" data-field="end">
                <button type="button" class="remove-leave-btn" 
                        data-university-index="${universityIndex}" data-leave-index="${newLeaveIndex}">×</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', leaveHtml);
        this.bindLeaveEvents();
    }

    // 휴학 기간 제거
    removeLeaveItem(universityIndex, leaveIndex) {
        const container = document.querySelector(`[data-university-index="${universityIndex}"].leave-container`);
        if (!container) return;

        const item = container.querySelector(`[data-university-index="${universityIndex}"][data-leave-index="${leaveIndex}"].leave-item`);
        if (item) {
            item.remove();
            this.reindexLeaveItems(universityIndex);
        }
    }

    // 휴학 기간 인덱스 재정렬
    reindexLeaveItems(universityIndex) {
        const container = document.querySelector(`[data-university-index="${universityIndex}"].leave-container`);
        if (!container) return;

        const items = container.querySelectorAll('.leave-item');
        items.forEach((item, newIndex) => {
            item.setAttribute('data-leave-index', newIndex);
            
            const inputs = item.querySelectorAll('input, button');
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                
                if (field) {
                    input.id = `leave-${universityIndex}-${newIndex}-${field}`;
                    input.setAttribute('data-leave-index', newIndex);
                } else if (input.classList.contains('remove-leave-btn')) {
                    input.setAttribute('data-leave-index', newIndex);
                }
            });
        });
    }

    // 교육 기간 데이터 수집
    collectEducationPeriods() {
        const periods = {};
        
        // 단일 교육 기간 (daycare, kindergarten, elementary, middle, high)
        const singleTypes = ['daycare', 'kindergarten', 'elementary', 'middle', 'high'];
        singleTypes.forEach(type => {
            const startInput = document.getElementById(`${type}-start`);
            const endInput = document.getElementById(`${type}-end`);
            
            periods[type] = {
                start: startInput?.value || null,
                end: endInput?.value || null
            };
        });

        // 복수 교육 기간 (university, other)
        const multiTypes = ['university', 'other'];
        multiTypes.forEach(type => {
            periods[type] = [];
            const container = document.getElementById(`${type}-container`);
            
            if (container) {
                const items = container.querySelectorAll('.education-item');
                items.forEach(item => {
                    const index = item.getAttribute('data-index');
                    const startInput = document.getElementById(`${type}-${index}-start`);
                    const endInput = document.getElementById(`${type}-${index}-end`);
                    const nameInput = document.getElementById(`${type}-${index}-name`);
                    
                    const start = startInput?.value || null;
                    const end = endInput?.value || null;
                    const name = nameInput?.value || null;
                    
                    // 최소한 시작일이나 종료일이 있으면 추가
                    if (start || end) {
                        const periodData = {
                            start: start,
                            end: end,
                            name: name
                        };

                        // 대학교인 경우 휴학 기간도 수집
                        if (type === 'university') {
                            periodData.leavePeriods = [];
                            const leaveContainer = item.querySelector(`[data-university-index="${index}"].leave-container`);
                            
                            if (leaveContainer) {
                                const leaveItems = leaveContainer.querySelectorAll('.leave-item');
                                leaveItems.forEach(leaveItem => {
                                    const leaveIndex = leaveItem.getAttribute('data-leave-index');
                                    const leaveStartInput = document.getElementById(`leave-${index}-${leaveIndex}-start`);
                                    const leaveEndInput = document.getElementById(`leave-${index}-${leaveIndex}-end`);
                                    
                                    const leaveStart = leaveStartInput?.value || null;
                                    const leaveEnd = leaveEndInput?.value || null;
                                    
                                    if (leaveStart || leaveEnd) {
                                        periodData.leavePeriods.push({
                                            start: leaveStart,
                                            end: leaveEnd
                                        });
                                    }
                                });
                            }
                        }

                        periods[type].push(periodData);
                    }
                });
            }
        });
        
        return periods;
    }

    // 메인 화면 렌더링
    renderMainScreen() {
        this.setupYearSelector();
        this.updateHeaderInfo();
        this.renderMonthsGrid();
    }

    // 연도 선택기 설정
    setupYearSelector() {
        const years = this.dataManager.getYearsList();
        this.yearSelector.innerHTML = '';
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}년`;
            if (year === this.currentYear) {
                option.selected = true;
            }
            this.yearSelector.appendChild(option);
        });

        // 네비게이션 버튼 활성화/비활성화
        this.prevYearBtn.disabled = this.currentYear <= years[0];
        this.nextYearBtn.disabled = this.currentYear >= years[years.length - 1];
    }

    // 헤더 정보 업데이트
    updateHeaderInfo() {
        const currentAge = this.dataManager.getCurrentAge();
        const ageForYear = this.dataManager.getAgeForYear(this.currentYear);
        this.currentYearDisplay.textContent = `${this.currentYear}년`;
        
        if (this.currentYear === new Date().getFullYear()) {
            this.ageDisplay.textContent = currentAge ? `만 ${currentAge}세` : '';
        } else {
            this.ageDisplay.textContent = ageForYear ? `만 ${ageForYear}세` : '';
        }
    }

    // 월별 그리드 렌더링
    renderMonthsGrid() {
        this.monthsGrid.innerHTML = '';
        
        for (let month = 1; month <= 12; month++) {
            const monthSquare = this.createMonthSquare(this.currentYear, month);
            this.monthsGrid.appendChild(monthSquare);
        }
    }

    // 월별 네모 생성
    createMonthSquare(year, month) {
        const square = document.createElement('div');
        square.className = 'month-square';
        
        // 월 상태 결정
        const isPast = this.dataManager.isPastMonth(year, month);
        const isCurrent = this.dataManager.isCurrentMonth(year, month);
        
        // 교육 기간 확인 (모든 겹치는 기간)
        const allEducationPeriods = this.dataManager.getAllEducationPeriodsForDate(year, month);
        
        if (allEducationPeriods.length > 0) {
            // 첫 번째 교육 기간의 색상 적용 (우선순위가 가장 높은 것)
            square.classList.add(`education-${allEducationPeriods[0].type}`);
        } else if (isPast) {
            square.classList.add('past');
        } else if (isCurrent) {
            square.classList.add('current');
        } else {
            square.classList.add('future');
        }

        // 월 이름
        const monthName = document.createElement('div');
        monthName.className = 'month-name';
        monthName.textContent = this.dataManager.getMonthName(month);
        square.appendChild(monthName);

        // 월 내용 - 중요한 일정 상위 3개 표시
        const monthContent = document.createElement('div');
        monthContent.className = 'month-content';
        
        const topImportantDays = this.dataManager.getTopImportantDaysInMonth(year, month);
        
        if (topImportantDays.length > 0) {
            const importantItems = document.createElement('div');
            importantItems.className = 'important-items';
            
            topImportantDays.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'important-item';
                
                const starsSpan = document.createElement('span');
                starsSpan.className = 'item-stars';
                starsSpan.textContent = this.dataManager.getStarsString(item.importance);
                
                const textSpan = document.createElement('span');
                textSpan.className = 'item-text';
                const fullText = `${item.displayName}: ${item.memo}`;
                textSpan.textContent = this.truncateText(fullText, this.getTextLimits().importantItem);
                textSpan.title = fullText; // 툴팁으로 전체 텍스트 표시
                
                itemDiv.appendChild(starsSpan);
                itemDiv.appendChild(textSpan);
                importantItems.appendChild(itemDiv);
            });
            
            monthContent.appendChild(importantItems);
        } else {
            const memo = this.dataManager.getMonthlyMemo(year, month);
            const displayText = memo || (isPast ? '기억을 추가해보세요' : '계획을 세워보세요');
            monthContent.textContent = this.truncateText(displayText, this.getTextLimits().month);
            if (memo && memo.length > this.getTextLimits().month) {
                monthContent.title = memo; // 툴팁으로 전체 텍스트 표시
            }
        }
        
        square.appendChild(monthContent);

        // 클릭 이벤트 - 주별 화면으로 이동
        square.addEventListener('click', () => this.showWeekScreen(year, month));
        
        // 우클릭 이벤트 - 메모 편집
        square.addEventListener('contextmenu', (e) => this.handleMonthMemoEdit(year, month, e));

        // 교육 기간 라벨들 추가
        if (allEducationPeriods.length > 0) {
            const educationLabelsContainer = document.createElement('div');
            educationLabelsContainer.className = 'education-labels-container';
            
            allEducationPeriods.forEach((period, index) => {
                const educationLabel = document.createElement('div');
                educationLabel.className = 'education-label-indicator';
                if (index > 0) {
                    educationLabel.classList.add('secondary-label');
                }
                
                // 기관명이 있으면 기관명 표시, 없으면 기본 타입명 표시
                const displayName = period.name && period.name !== this.dataManager.getEducationPeriodName(period.type) 
                    ? period.name 
                    : this.dataManager.getEducationPeriodShortName(period.type);
                    
                educationLabel.textContent = displayName;
                educationLabelsContainer.appendChild(educationLabel);
            });
            
            square.appendChild(educationLabelsContainer);
        }

        return square;
    }

    // 월별 메모 편집 (우클릭 시)
    handleMonthMemoEdit(year, month, event) {
        event.preventDefault(); // 컨텍스트 메뉴 방지
        const memo = this.dataManager.getMonthlyMemo(year, month);
        
        this.showModal(
            `${year}년 ${this.dataManager.getMonthName(month)} 메모`,
            memo,
            (newMemo) => {
                this.dataManager.setMonthlyMemo(year, month, newMemo);
                this.renderMonthsGrid();
            }
        );
    }

    // 주별 화면 렌더링
    renderWeekScreen(year, month) {
        this.weekTitle.textContent = `${year}년 ${this.dataManager.getMonthName(month)}`;
        this.weeksGrid.innerHTML = '';
        
        for (let week = 1; week <= 4; week++) {
            const weekSquare = this.createWeekSquare(year, month, week);
            this.weeksGrid.appendChild(weekSquare);
        }
    }

    // 주별 네모 생성
    createWeekSquare(year, month, week) {
        const square = document.createElement('div');
        square.className = 'week-square';
        
        // 주 상태 결정
        const isPast = this.dataManager.isPastWeek(year, month, week);
        const isCurrent = this.dataManager.isCurrentWeek(year, month, week);
        
        // 교육 기간 확인 (주차의 첫 번째 날 기준)
        const firstDayOfWeek = (week - 1) * 7 + 1;
        const allEducationPeriods = this.dataManager.getAllEducationPeriodsForDate(year, month, firstDayOfWeek);
        
        if (allEducationPeriods.length > 0) {
            // 첫 번째 교육 기간의 색상 적용 (우선순위가 가장 높은 것)
            square.classList.add(`education-${allEducationPeriods[0].type}`);
        } else if (isPast) {
            square.classList.add('past');
        } else if (isCurrent) {
            square.classList.add('current');
        } else {
            square.classList.add('future');
        }

        // 주 이름
        const weekName = document.createElement('div');
        weekName.className = 'week-name';
        weekName.textContent = this.dataManager.getWeekName(week);
        square.appendChild(weekName);

        // 주 내용 - 중요한 일정 상위 3개 표시
        const weekContent = document.createElement('div');
        weekContent.className = 'week-content';
        
        const topImportantDays = this.dataManager.getTopImportantDaysInWeek(year, month, week);
        
        if (topImportantDays.length > 0) {
            const importantItems = document.createElement('div');
            importantItems.className = 'important-items';
            
            topImportantDays.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'important-item';
                
                const starsSpan = document.createElement('span');
                starsSpan.className = 'item-stars';
                starsSpan.textContent = this.dataManager.getStarsString(item.importance);
                
                const textSpan = document.createElement('span');
                textSpan.className = 'item-text';
                const fullText = `${item.displayName}: ${item.memo}`;
                textSpan.textContent = this.truncateText(fullText, this.getTextLimits().importantItem);
                textSpan.title = fullText; // 툴팁으로 전체 텍스트 표시
                
                itemDiv.appendChild(starsSpan);
                itemDiv.appendChild(textSpan);
                importantItems.appendChild(itemDiv);
            });
            
            weekContent.appendChild(importantItems);
        } else {
            const memo = this.dataManager.getWeeklyMemo(year, month, week);
            const displayText = memo || (isPast ? '기억을 추가해보세요' : '할 일을 계획해보세요');
            weekContent.textContent = this.truncateText(displayText, this.getTextLimits().week);
            if (memo && memo.length > this.getTextLimits().week) {
                weekContent.title = memo; // 툴팁으로 전체 텍스트 표시
            }
        }
        
        square.appendChild(weekContent);

        // 클릭 이벤트 - 일별 화면으로 이동
        square.addEventListener('click', () => this.showDayScreen(year, month, week));
        
        // 우클릭 이벤트 - 주별 메모 편집
        square.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const memo = this.dataManager.getWeeklyMemo(year, month, week);
            this.showModal(
                `${year}년 ${this.dataManager.getMonthName(month)} ${this.dataManager.getWeekName(week)} 메모`,
                memo,
                (newMemo) => {
                    this.dataManager.setWeeklyMemo(year, month, week, newMemo);
                    this.renderWeekScreen(year, month);
                }
            );
        });

        // 교육 기간 라벨들 추가
        if (allEducationPeriods.length > 0) {
            const educationLabelsContainer = document.createElement('div');
            educationLabelsContainer.className = 'education-labels-container';
            
            allEducationPeriods.forEach((period, index) => {
                const educationLabel = document.createElement('div');
                educationLabel.className = 'education-label-indicator';
                if (index > 0) {
                    educationLabel.classList.add('secondary-label');
                }
                
                // 기관명이 있으면 기관명 표시, 없으면 기본 타입명 표시
                const displayName = period.name && period.name !== this.dataManager.getEducationPeriodName(period.type) 
                    ? period.name 
                    : this.dataManager.getEducationPeriodShortName(period.type);
                    
                educationLabel.textContent = displayName;
                educationLabelsContainer.appendChild(educationLabel);
            });
            
            square.appendChild(educationLabelsContainer);
        }

        return square;
    }

    // 일별 화면 렌더링
    renderDayScreen(year, month, week) {
        this.dayTitle.textContent = `${year}년 ${this.dataManager.getMonthName(month)} ${this.dataManager.getWeekName(week)}`;
        this.daysGrid.innerHTML = '';
        
        const daysInWeek = this.dataManager.getDaysInWeek(year, month, week);
        
        daysInWeek.forEach(day => {
            const daySquare = this.createDaySquare(year, month, day);
            this.daysGrid.appendChild(daySquare);
        });
    }

    // 일별 네모 생성
    createDaySquare(year, month, day) {
        const square = document.createElement('div');
        square.className = 'day-square';
        
        // 일 상태 결정
        const isPast = this.dataManager.isPastDay(year, month, day);
        const isCurrent = this.dataManager.isCurrentDay(year, month, day);
        
        // 교육 기간 확인
        const allEducationPeriods = this.dataManager.getAllEducationPeriodsForDate(year, month, day);
        
        if (allEducationPeriods.length > 0) {
            // 첫 번째 교육 기간의 색상 적용 (우선순위가 가장 높은 것)
            square.classList.add(`education-${allEducationPeriods[0].type}`);
        } else if (isPast) {
            square.classList.add('past');
        } else if (isCurrent) {
            square.classList.add('current');
        } else {
            square.classList.add('future');
        }

        // 요일 이름
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = this.dataManager.getDayName(year, month, day);
        square.appendChild(dayName);

        // 날짜 번호
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        square.appendChild(dayNumber);

        // 일 내용
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        const dailyData = this.dataManager.getDailyData(year, month, day);
        const displayText = dailyData.memo || (isPast ? '기억 추가' : '계획 세우기');
        dayContent.textContent = this.truncateText(displayText, this.getTextLimits().day);
        if (dailyData.memo && dailyData.memo.length > this.getTextLimits().day) {
            dayContent.title = dailyData.memo; // 툴팁으로 전체 텍스트 표시
        }
        square.appendChild(dayContent);

        // 중요도 별점 표시
        if (dailyData.importance > 0) {
            const importanceStars = document.createElement('div');
            importanceStars.className = 'importance-stars';
            importanceStars.textContent = this.dataManager.getStarsString(dailyData.importance);
            square.appendChild(importanceStars);
        }

        // 클릭 이벤트
        square.addEventListener('click', () => this.handleDayClick(year, month, day));

        // 교육 기간 라벨들 추가
        if (allEducationPeriods.length > 0) {
            const educationLabelsContainer = document.createElement('div');
            educationLabelsContainer.className = 'education-labels-container';
            
            allEducationPeriods.forEach((period, index) => {
                const educationLabel = document.createElement('div');
                educationLabel.className = 'education-label-indicator';
                if (index > 0) {
                    educationLabel.classList.add('secondary-label');
                }
                
                // 기관명이 있으면 기관명 표시, 없으면 기본 타입명 표시
                const displayName = period.name && period.name !== this.dataManager.getEducationPeriodName(period.type) 
                    ? period.name 
                    : this.dataManager.getEducationPeriodShortName(period.type);
                    
                educationLabel.textContent = displayName;
                educationLabelsContainer.appendChild(educationLabel);
            });
            
            square.appendChild(educationLabelsContainer);
        }

        return square;
    }

    // 일 클릭 처리
    handleDayClick(year, month, day) {
        const dailyData = this.dataManager.getDailyData(year, month, day);
        const dayName = this.dataManager.getDayDisplayName(year, month, day);
        
        this.showModal(
            `${year}년 ${this.dataManager.getMonthName(month)} ${dayName}`,
            dailyData.memo,
            (newMemo, importance) => {
                this.dataManager.setDailyMemo(year, month, day, newMemo, importance);
                this.renderDayScreen(this.currentWeek.year, this.currentWeek.month, this.currentWeek.week);
            },
            true, // 중요도 섹션 표시
            dailyData.importance
        );
    }

    // 연도 변경
    changeYear(direction) {
        const years = this.dataManager.getYearsList();
        const currentIndex = years.indexOf(this.currentYear);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < years.length) {
            this.currentYear = years[newIndex];
            this.yearSelector.value = this.currentYear;
            this.renderMainScreen();
        }
    }

    // 모달 표시
    showModal(title, content, onSave, showImportance = false, currentImportance = 0) {
        this.modalTitle.textContent = title;
        this.modalTextarea.value = content;
        
        // 중요도 섹션 표시/숨기기
        if (showImportance) {
            this.importanceSection.classList.remove('hidden');
            this.setRating(currentImportance);
        } else {
            this.importanceSection.classList.add('hidden');
            this.setRating(0);
        }
        
        this.modal.classList.remove('hidden');
        this.modalTextarea.focus();
        
        this.currentModalSaveHandler = onSave;
    }

    // 별점 설정
    setRating(rating) {
        this.currentImportance = rating;
        this.highlightStars(rating);
        this.updateRatingText(rating);
    }

    // 별점 하이라이트
    highlightStars(rating) {
        this.stars.forEach((star, index) => {
            star.classList.remove('active', 'hover');
            if (index < rating) {
                star.classList.add('active');
            }
        });
    }

    // 별점 텍스트 업데이트
    updateRatingText(rating) {
        const texts = [
            '중요도를 선택하세요',
            '낮은 중요도',
            '조금 중요',
            '보통 중요',
            '매우 중요',
            '최고 중요도'
        ];
        this.ratingText.textContent = texts[rating];
    }

    // 모달 숨기기
    hideModal() {
        this.modal.classList.add('hidden');
        this.currentModalSaveHandler = null;
    }

    // 저장 처리
    handleSave() {
        if (this.currentModalSaveHandler) {
            const content = this.modalTextarea.value.trim();
            const importance = this.importanceSection.classList.contains('hidden') ? 0 : this.currentImportance;
            this.currentModalSaveHandler(content, importance);
        }
        this.hideModal();
    }

    // 내보내기 모달 표시
    showExportModal() {
        const data = this.dataManager.exportData();
        this.exportData.value = data;
        this.exportModal.classList.remove('hidden');
    }

    // 내보내기 모달 숨기기
    hideExportModal() {
        this.exportModal.classList.add('hidden');
    }

    // 데이터 복사
    async copyExportData() {
        try {
            await navigator.clipboard.writeText(this.exportData.value);
            this.copyDataBtn.textContent = '복사됨!';
            setTimeout(() => {
                this.copyDataBtn.textContent = '복사하기';
            }, 2000);
        } catch (error) {
            console.error('복사 실패:', error);
            this.exportData.select();
            alert('데이터를 선택하여 직접 복사해주세요.');
        }
    }

    // 테마 토글
    toggleTheme() {
        const currentTheme = this.dataManager.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.dataManager.setTheme(newTheme);
        this.applyTheme();
    }

    // 테마 적용
    applyTheme() {
        const theme = this.dataManager.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    // 초기화 처리
    handleReset() {
        if (confirm('모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
            this.dataManager.resetAllData();
            this.showSetupScreen();
        }
    }

    // 에러 메시지 표시
    showError(message) {
        alert(message);
    }

    // 성공 메시지 표시
    showSuccess(message) {
        // 간단한 토스트 메시지 (선택사항)
        console.log('Success:', message);
    }
}