/**
 * 데이터 관리 모듈
 * 로컬 스토리지를 통한 데이터 영속성 관리
 */

class DataManager {
    constructor() {
        this.storageKey = 'life-squares-data';
        this.data = this.loadData();
        this.initializeData();
    }

    // 기본 데이터 구조 초기화
    initializeData() {
        if (!this.data.userInfo) {
            this.data.userInfo = {
                birthDate: null,
                lifeExpectancy: 80,
                setupCompleted: false
            };
        }

        if (!this.data.educationPeriods) {
            this.data.educationPeriods = {
                daycare: { start: null, end: null },
                kindergarten: { start: null, end: null },
                elementary: { start: null, end: null },
                middle: { start: null, end: null },
                high: { start: null, end: null },
                university: [],
                other: []
            };
        }

        // 기존 데이터 구조 업그레이드 (단일 객체를 배열로 변환)
        if (this.data.educationPeriods.university && !Array.isArray(this.data.educationPeriods.university)) {
            const oldUniversity = this.data.educationPeriods.university;
            this.data.educationPeriods.university = oldUniversity.start || oldUniversity.end ? [oldUniversity] : [];
        }
        if (this.data.educationPeriods.other && !Array.isArray(this.data.educationPeriods.other)) {
            const oldOther = this.data.educationPeriods.other;
            this.data.educationPeriods.other = oldOther.start || oldOther.end || oldOther.name ? [oldOther] : [];
        }

        // 대학교 휴학 기간 데이터 구조 추가
        if (this.data.educationPeriods.university) {
            this.data.educationPeriods.university.forEach(university => {
                if (!university.leavePeriods) {
                    university.leavePeriods = [];
                }
            });
        }

        if (!this.data.monthlyData) {
            this.data.monthlyData = {};
        }

        if (!this.data.weeklyData) {
            this.data.weeklyData = {};
        }

        if (!this.data.dailyData) {
            this.data.dailyData = {};
        }

        if (!this.data.settings) {
            this.data.settings = {
                theme: 'light'
            };
        }
    }

    // 로컬 스토리지에서 데이터 로드
    loadData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            return storedData ? JSON.parse(storedData) : {};
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            return {};
        }
    }

    // 로컬 스토리지에 데이터 저장
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('데이터 저장 실패:', error);
            return false;
        }
    }

    // 사용자 정보 설정 (교육 기간 포함)
    setUserInfo(birthDate, lifeExpectancy, educationPeriods = null) {
        this.data.userInfo = {
            birthDate: birthDate,
            lifeExpectancy: parseInt(lifeExpectancy),
            setupCompleted: true
        };
        
        if (educationPeriods) {
            this.data.educationPeriods = educationPeriods;
        }
        
        return this.saveData();
    }

    // 사용자 정보 조회
    getUserInfo() {
        return this.data.userInfo;
    }

    // 현재 만나이 계산
    getCurrentAge() {
        if (!this.data.userInfo.birthDate) return null;
        
        const birthDate = new Date(this.data.userInfo.birthDate);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // 특정 날짜의 만나이 계산
    getAgeAtDate(targetDate) {
        if (!this.data.userInfo.birthDate) return null;
        
        const birthDate = new Date(this.data.userInfo.birthDate);
        const target = new Date(targetDate);
        
        let age = target.getFullYear() - birthDate.getFullYear();
        const monthDiff = target.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // 특정 연도의 만나이 계산 (해당 연도 12월 31일 기준)
    getAgeForYear(year) {
        if (!this.data.userInfo.birthDate) return null;
        return this.getAgeAtDate(new Date(year, 11, 31));
    }

    // 생년 가져오기
    getBirthYear() {
        if (!this.data.userInfo.birthDate) return null;
        return new Date(this.data.userInfo.birthDate).getFullYear();
    }

    // 현재 연도와 월 정보 가져오기
    getCurrentDate() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1
        };
    }

    // 월별 데이터 키 생성
    getMonthKey(year, month) {
        return `${year}-${month.toString().padStart(2, '0')}`;
    }

    // 주별 데이터 키 생성
    getWeekKey(year, month, week) {
        return `${year}-${month.toString().padStart(2, '0')}-W${week}`;
    }

    // 일별 데이터 키 생성
    getDayKey(year, month, day) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    // 월별 메모 저장
    setMonthlyMemo(year, month, memo) {
        const key = this.getMonthKey(year, month);
        this.data.monthlyData[key] = {
            memo: memo,
            lastUpdated: new Date().toISOString()
        };
        return this.saveData();
    }

    // 월별 메모 조회
    getMonthlyMemo(year, month) {
        const key = this.getMonthKey(year, month);
        return this.data.monthlyData[key]?.memo || '';
    }

    // 주별 메모 저장
    setWeeklyMemo(year, month, week, memo) {
        const key = this.getWeekKey(year, month, week);
        this.data.weeklyData[key] = {
            memo: memo,
            lastUpdated: new Date().toISOString()
        };
        return this.saveData();
    }

    // 주별 메모 조회
    getWeeklyMemo(year, month, week) {
        const key = this.getWeekKey(year, month, week);
        return this.data.weeklyData[key]?.memo || '';
    }

    // 일별 메모 저장 (중요도 포함)
    setDailyMemo(year, month, day, memo, importance = 0) {
        const key = this.getDayKey(year, month, day);
        this.data.dailyData[key] = {
            memo: memo,
            importance: parseInt(importance),
            lastUpdated: new Date().toISOString()
        };
        return this.saveData();
    }

    // 일별 메모 조회
    getDailyMemo(year, month, day) {
        const key = this.getDayKey(year, month, day);
        return this.data.dailyData[key]?.memo || '';
    }

    // 일별 중요도 조회
    getDailyImportance(year, month, day) {
        const key = this.getDayKey(year, month, day);
        return this.data.dailyData[key]?.importance || 0;
    }

    // 일별 전체 데이터 조회
    getDailyData(year, month, day) {
        const key = this.getDayKey(year, month, day);
        return this.data.dailyData[key] || { memo: '', importance: 0 };
    }

    // 월이 지나간 달인지 확인
    isPastMonth(year, month) {
        const current = this.getCurrentDate();
        return year < current.year || (year === current.year && month < current.month);
    }

    // 월이 현재 달인지 확인
    isCurrentMonth(year, month) {
        const current = this.getCurrentDate();
        return year === current.year && month === current.month;
    }

    // 주가 지나간 주인지 확인
    isPastWeek(year, month, week) {
        const current = this.getCurrentDate();
        const now = new Date();
        const currentWeek = Math.ceil(now.getDate() / 7);
        
        if (year < current.year || (year === current.year && month < current.month)) {
            return true;
        }
        
        if (year === current.year && month === current.month) {
            return week < currentWeek;
        }
        
        return false;
    }

    // 주가 현재 주인지 확인
    isCurrentWeek(year, month, week) {
        const current = this.getCurrentDate();
        const now = new Date();
        const currentWeek = Math.ceil(now.getDate() / 7);
        
        return year === current.year && month === current.month && week === currentWeek;
    }

    // 일이 지나간 날인지 확인
    isPastDay(year, month, day) {
        const current = this.getCurrentDate();
        const now = new Date();
        
        if (year < current.year || (year === current.year && month < current.month)) {
            return true;
        }
        
        if (year === current.year && month === current.month) {
            return day < now.getDate();
        }
        
        return false;
    }

    // 일이 현재 날인지 확인
    isCurrentDay(year, month, day) {
        const current = this.getCurrentDate();
        const now = new Date();
        
        return year === current.year && month === current.month && day === now.getDate();
    }

    // 특정 연월의 일수 구하기
    getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    // 특정 주차의 일자 범위 구하기
    getDaysInWeek(year, month, week) {
        const daysInMonth = this.getDaysInMonth(year, month);
        const startDay = (week - 1) * 7 + 1;
        const endDay = Math.min(week * 7, daysInMonth);
        
        const days = [];
        for (let day = startDay; day <= endDay; day++) {
            days.push(day);
        }
        return days;
    }

    // 모든 연도 목록 생성
    getYearsList() {
        const userInfo = this.data.userInfo;
        const birthYear = this.getBirthYear();
        if (!birthYear || !userInfo.lifeExpectancy) return [];
        
        const years = [];
        const endYear = birthYear + userInfo.lifeExpectancy;
        
        for (let year = birthYear; year <= endYear; year++) {
            years.push(year);
        }
        
        return years;
    }

    // 테마 설정
    setTheme(theme) {
        this.data.settings.theme = theme;
        return this.saveData();
    }

    // 테마 조회
    getTheme() {
        return this.data.settings.theme || 'light';
    }

    // 모든 데이터 내보내기
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // 데이터 가져오기
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = { ...this.data, ...importedData };
            this.initializeData();
            return this.saveData();
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            return false;
        }
    }

    // 모든 데이터 초기화
    resetAllData() {
        this.data = {};
        this.initializeData();
        return this.saveData();
    }

    // 통계 정보 가져오기
    getStatistics() {
        const userInfo = this.data.userInfo;
        if (!userInfo.setupCompleted) return null;

        const totalMonths = userInfo.lifeExpectancy * 12;
        const currentAge = this.getCurrentAge();
        const livedMonths = currentAge * 12;
        const remainingMonths = totalMonths - livedMonths;

        const monthlyMemos = Object.keys(this.data.monthlyData).length;
        const weeklyMemos = Object.keys(this.data.weeklyData).length;
        const dailyMemos = Object.keys(this.data.dailyData).length;

        return {
            totalMonths,
            livedMonths,
            remainingMonths,
            monthlyMemos,
            weeklyMemos,
            dailyMemos,
            completionRate: Math.round((livedMonths / totalMonths) * 100)
        };
    }

    // 월별 이름 반환
    getMonthName(month) {
        const monthNames = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        return monthNames[month - 1];
    }

    // 주별 이름 반환
    getWeekName(week) {
        return `${week}주차`;
    }

    // 요일 이름 반환
    getDayName(year, month, day) {
        const date = new Date(year, month - 1, day);
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        return dayNames[date.getDay()];
    }

    // 일별 표시명 반환 (날짜 + 요일)
    getDayDisplayName(year, month, day) {
        const dayName = this.getDayName(year, month, day);
        return `${day}일 (${dayName})`;
    }

    // 특정 주의 중요한 일정 상위 3개 가져오기
    getTopImportantDaysInWeek(year, month, week) {
        const daysInWeek = this.getDaysInWeek(year, month, week);
        const importantDays = [];

        daysInWeek.forEach(day => {
            const data = this.getDailyData(year, month, day);
            if (data.memo && data.importance > 0) {
                importantDays.push({
                    day: day,
                    memo: data.memo,
                    importance: data.importance,
                    displayName: `${day}일`
                });
            }
        });

        // 중요도 순으로 정렬하고 상위 3개 반환
        return importantDays
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 3);
    }

    // 특정 월의 중요한 일정 상위 3개 가져오기
    getTopImportantDaysInMonth(year, month) {
        const daysInMonth = this.getDaysInMonth(year, month);
        const importantDays = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const data = this.getDailyData(year, month, day);
            if (data.memo && data.importance > 0) {
                importantDays.push({
                    day: day,
                    memo: data.memo,
                    importance: data.importance,
                    displayName: `${day}일`
                });
            }
        }

        // 중요도 순으로 정렬하고 상위 3개 반환
        return importantDays
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 3);
    }

    // 중요도를 별 문자열로 변환
    getStarsString(importance) {
        return '★'.repeat(importance);
    }

    // 교육 기간 조회
    getEducationPeriods() {
        return this.data.educationPeriods;
    }

    // 특정 날짜가 어떤 교육 기간에 속하는지 확인 (첫 번째 일치하는 것만)
    getEducationPeriodForDate(year, month, day = 1) {
        const allPeriods = this.getAllEducationPeriodsForDate(year, month, day);
        return allPeriods.length > 0 ? allPeriods[0] : null;
    }

    // 특정 날짜에 해당하는 모든 교육 기간 반환
    getAllEducationPeriodsForDate(year, month, day = 1) {
        const targetDate = new Date(year, month - 1, day);
        const periods = this.data.educationPeriods;
        const matchingPeriods = [];
        
        for (const [periodType, periodData] of Object.entries(periods)) {
            if (Array.isArray(periodData)) {
                // university와 other는 배열
                if (periodType === 'university') {
                    // 대학교는 휴학 기간을 고려
                    for (const university of periodData) {
                        if (this.isInUniversityPeriod(targetDate, university)) {
                            matchingPeriods.push({
                                type: periodType,
                                name: university.name || this.getEducationPeriodName(periodType),
                                startDate: this.monthStringToStartDate(university.start),
                                endDate: this.monthStringToEndDate(university.end),
                                priority: this.getEducationPeriodPriority(periodType)
                            });
                        }
                    }
                } else {
                    // other는 기존 로직 유지
                    for (const period of periodData) {
                        if (period.start && period.end) {
                            const startDate = this.monthStringToStartDate(period.start);
                            const endDate = this.monthStringToEndDate(period.end);
                            
                            if (startDate && endDate && targetDate >= startDate && targetDate <= endDate) {
                                matchingPeriods.push({
                                    type: periodType,
                                    name: period.name || this.getEducationPeriodName(periodType),
                                    startDate: startDate,
                                    endDate: endDate,
                                    priority: this.getEducationPeriodPriority(periodType)
                                });
                            }
                        }
                    }
                }
            } else {
                // daycare, kindergarten, elementary, middle, high는 단일 객체
                if (periodData.start && periodData.end) {
                    const startDate = this.monthStringToStartDate(periodData.start);
                    const endDate = this.monthStringToEndDate(periodData.end);
                    
                    if (startDate && endDate && targetDate >= startDate && targetDate <= endDate) {
                        matchingPeriods.push({
                            type: periodType,
                            name: periodData.name || this.getEducationPeriodName(periodType),
                            startDate: startDate,
                            endDate: endDate,
                            priority: this.getEducationPeriodPriority(periodType)
                        });
                    }
                }
            }
        }
        
        // 우선순위별로 정렬 (우선순위가 높을수록 먼저)
        return matchingPeriods.sort((a, b) => a.priority - b.priority);
    }

    // 교육 기간별 우선순위 반환 (낮을수록 높은 우선순위)
    getEducationPeriodPriority(type) {
        const priorities = {
            daycare: 1,
            kindergarten: 2,
            elementary: 3,
            middle: 4,
            high: 5,
            university: 6,
            other: 7
        };
        return priorities[type] || 99;
    }

    // 교육 기간 타입별 한글 이름 반환
    getEducationPeriodName(type) {
        const names = {
            daycare: '어린이집',
            kindergarten: '유치원',
            elementary: '초등학교',
            middle: '중학교',
            high: '고등학교',
            university: '대학교',
            other: '기타'
        };
        return names[type] || type;
    }

    // 교육 기간 축약 이름 반환
    getEducationPeriodShortName(type) {
        const shortNames = {
            daycare: '어린이집',
            kindergarten: '유치원',
            elementary: '초등',
            middle: '중등',
            high: '고등',
            university: '대학',
            other: '기타'
        };
        return shortNames[type] || type;
    }

    // 특정 교육 기간의 마지막 종료일 가져오기 (자동 날짜 설정용)
    getLastEndDateBeforeType(type) {
        const typeOrder = ['daycare', 'kindergarten', 'elementary', 'middle', 'high', 'university', 'other'];
        const currentIndex = typeOrder.indexOf(type);
        
        if (currentIndex <= 0) return null;
        
        let lastEndDate = null;
        
        // 현재 타입 이전의 모든 교육 기간을 확인
        for (let i = currentIndex - 1; i >= 0; i--) {
            const prevType = typeOrder[i];
            const periodData = this.data.educationPeriods[prevType];
            
            if (Array.isArray(periodData)) {
                // university와 other는 배열
                for (const period of periodData) {
                    if (period.end) {
                        const endDate = this.monthStringToEndDate(period.end);
                        if (endDate && (!lastEndDate || endDate > lastEndDate)) {
                            lastEndDate = endDate;
                        }
                    }
                }
            } else {
                // 단일 객체
                if (periodData && periodData.end) {
                    const endDate = this.monthStringToEndDate(periodData.end);
                    if (endDate && (!lastEndDate || endDate > lastEndDate)) {
                        lastEndDate = endDate;
                    }
                }
            }
        }
        
        return lastEndDate;
    }

    // 날짜에 한 달 추가하여 YYYY-MM 형식으로 반환
    getNextMonthDateString(date) {
        if (!date) return '';
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const year = nextMonth.getFullYear();
        const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    // month 타입 입력값을 Date 객체로 변환 (해당 월의 마지막 날로 설정)
    monthStringToEndDate(monthString) {
        if (!monthString) return null;
        const [year, month] = monthString.split('-');
        return new Date(parseInt(year), parseInt(month), 0); // 0은 이전 달의 마지막 날
    }

    // month 타입 입력값을 Date 객체로 변환 (해당 월의 첫 번째 날로 설정)  
    monthStringToStartDate(monthString) {
        if (!monthString) return null;
        const [year, month] = monthString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    // 특정 날짜가 대학교 휴학 기간에 속하는지 확인
    isInLeavePeriod(targetDate, university) {
        if (!university.leavePeriods || university.leavePeriods.length === 0) {
            return false;
        }

        for (const leavePeriod of university.leavePeriods) {
            if (leavePeriod.start && leavePeriod.end) {
                const startDate = this.monthStringToStartDate(leavePeriod.start);
                const endDate = this.monthStringToEndDate(leavePeriod.end);
                
                if (startDate && endDate && targetDate >= startDate && targetDate <= endDate) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // 대학교 기간인지 확인 (휴학 기간 제외)
    isInUniversityPeriod(targetDate, university) {
        if (!university.start || !university.end) {
            return false;
        }

        const startDate = this.monthStringToStartDate(university.start);
        const endDate = this.monthStringToEndDate(university.end);
        
        if (!startDate || !endDate || targetDate < startDate || targetDate > endDate) {
            return false;
        }

        // 휴학 기간에 속하면 대학교 기간이 아님
        return !this.isInLeavePeriod(targetDate, university);
    }
}