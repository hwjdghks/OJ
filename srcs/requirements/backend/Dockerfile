# Node.js 이미지 사용
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 애플리케이션 포트 노출
# EXPOSE 5000

# 서버 실행
CMD ["npm", "start"]
