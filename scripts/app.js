/**
 * 메인 애플리케이션 파일
 * 앱 초기화 및 전역 이벤트 관리
 */

class LifeSquaresApp {
    constructor() {
        this.dataManager = null;
        this.uiController = null;
        this.isInitialized = false;
    }

    // 앱 초기화
    async init() {
        try {
            // 로딩 표시 (선택사항)
            this.showLoading();

            // 데이터 매니저 초기화
            this.dataManager = new DataManager();
            
            // UI 컨트롤러 초기화
            this.uiController = new UIController(this.dataManager);
            
            // 전역 이벤트 리스너 설정
            this.setupGlobalEventListeners();
            
            // 초기 화면 설정
            this.uiController.initializeScreen();
            
            // 초기화 완료
            this.isInitialized = true;
            
            // 로딩 숨기기
            this.hideLoading();
            
            console.log('Life Squares 앱이 성공적으로 초기화되었습니다.');
            
        } catch (error) {
            console.error('앱 초기화 실패:', error);
            this.showError('앱을 시작하는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        }
    }

    // 전역 이벤트 리스너 설정
    setupGlobalEventListeners() {
        // 페이지 언로드 시 데이터 저장 확인
        window.addEventListener('beforeunload', (e) => {
            // 중요한 변경사항이 있을 경우 경고 (선택사항)
            // e.preventDefault();
            // e.returnValue = '';
        });

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            console.log('인터넷 연결이 복구되었습니다.');
        });

        window.addEventListener('offline', () => {
            console.log('인터넷 연결이 끊어졌습니다. 데이터는 로컬에 저장됩니다.');
        });

        // 페이지 가시성 변경 감지
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            } else {
                this.handlePageHidden();
            }
        });
    }

    // 키보드 단축키 처리
    handleKeyboardShortcuts(e) {
        if (!this.isInitialized) return;

        // Ctrl/Cmd + 키 조합
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'e':
                    e.preventDefault();
                    if (this.uiController.currentScreen === 'main') {
                        this.uiController.showExportModal();
                    }
                    break;
                    
                case 't':
                    e.preventDefault();
                    this.uiController.toggleTheme();
                    break;
                    
                case 'r':
                    e.preventDefault();
                    if (confirm('페이지를 새로고침하시겠습니까?')) {
                        location.reload();
                    }
                    break;
            }
        }

        // 단일 키 단축키
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key) {
                case 'ArrowLeft':
                    if (this.uiController.currentScreen === 'main') {
                        e.preventDefault();
                        this.uiController.changeYear(-1);
                    }
                    break;
                    
                case 'ArrowRight':
                    if (this.uiController.currentScreen === 'main') {
                        e.preventDefault();
                        this.uiController.changeYear(1);
                    }
                    break;
                    
                case 'Escape':
                    if (this.uiController.currentScreen === 'day') {
                        this.uiController.showWeekScreen(
                            this.uiController.currentWeek.year, 
                            this.uiController.currentWeek.month
                        );
                    } else if (this.uiController.currentScreen === 'week') {
                        this.uiController.showMainScreen();
                    }
                    break;
            }
        }
    }

    // 윈도우 리사이즈 처리
    handleResize() {
        // 텍스트 길이 제한이 화면 크기에 따라 변경되므로 UI 재렌더링
        if (this.isInitialized && this.uiController) {
            if (this.uiController.currentScreen === 'main') {
                this.uiController.renderMainScreen();
            } else if (this.uiController.currentScreen === 'week' && this.uiController.currentMonth) {
                this.uiController.renderWeekScreen(
                    this.uiController.currentMonth.year, 
                    this.uiController.currentMonth.month
                );
            } else if (this.uiController.currentScreen === 'day' && this.uiController.currentWeek) {
                this.uiController.renderDayScreen(
                    this.uiController.currentWeek.year, 
                    this.uiController.currentWeek.month, 
                    this.uiController.currentWeek.week
                );
            }
        }
    }

    // 페이지가 보일 때 처리
    handlePageVisible() {
        // 데이터 동기화 또는 새로고침 (선택사항)
        if (this.isInitialized && this.uiController.currentScreen === 'main') {
            // 현재 시간 기준으로 UI 업데이트
            this.uiController.renderMainScreen();
        }
    }

    // 페이지가 숨겨질 때 처리
    handlePageHidden() {
        // 필요한 경우 데이터 저장
        if (this.isInitialized) {
            this.dataManager.saveData();
        }
    }

    // 로딩 표시
    showLoading() {
        // 간단한 로딩 인디케이터 (선택사항)
        document.body.style.cursor = 'wait';
    }

    // 로딩 숨기기
    hideLoading() {
        document.body.style.cursor = 'default';
    }

    // 에러 표시
    showError(message) {
        alert(`오류가 발생했습니다: ${message}`);
    }

    // 디바운스 유틸리티 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 앱 정보 반환
    getAppInfo() {
        return {
            name: '삶을 정리하는 네모들',
            version: '1.0.0',
            author: 'Life Squares Team',
            initialized: this.isInitialized
        };
    }

    // 통계 정보 가져오기
    getStatistics() {
        if (!this.isInitialized) return null;
        return this.dataManager.getStatistics();
    }

    // 디버그 정보 출력
    debug() {
        if (!this.isInitialized) {
            console.log('앱이 아직 초기화되지 않았습니다.');
            return;
        }

        console.group('Life Squares Debug Info');
        console.log('앱 정보:', this.getAppInfo());
        console.log('사용자 정보:', this.dataManager.getUserInfo());
        console.log('통계:', this.getStatistics());
        console.log('현재 테마:', this.dataManager.getTheme());
        console.log('현재 화면:', this.uiController.currentScreen);
        console.log('현재 연도:', this.uiController.currentYear);
        console.groupEnd();
    }
}

// 전역 변수로 앱 인스턴스 생성
let app;

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
    app = new LifeSquaresApp();
    await app.init();
});

// 전역 디버그 함수들 (개발용)
window.lifeSquares = {
    debug: () => app?.debug(),
    getStats: () => app?.getStatistics(),
    exportData: () => app?.dataManager?.exportData(),
    reset: () => {
        if (confirm('정말 모든 데이터를 초기화하시겠습니까?')) {
            app?.dataManager?.resetAllData();
            location.reload();
        }
    }
};

// 서비스 워커 등록 (PWA 지원을 위한 선택사항)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(registrationError => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// 에러 처리
window.addEventListener('error', (e) => {
    console.error('전역 에러:', e.error);
    // 필요한 경우 에러 로깅 서비스로 전송
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('처리되지 않은 Promise 거부:', e.reason);
    // 필요한 경우 에러 로깅 서비스로 전송
});