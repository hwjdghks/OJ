# Node.js 이미지 사용
FROM node:20

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 애플리케이션 포트 노출
EXPOSE 3000

# 배포시 설정
# 개발환경에선 useEffect가 두번 실행되기 때문에 요청이 두번 발생함
# RUN npm run build
# CMD ["npm", "run", "start"]

# 서버 실행
CMD ["npm", "run", "dev"]
