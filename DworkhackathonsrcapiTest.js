// GitLab & Redmine API 연동 테스트 예제
// API 키와 URL을 아래 변수에 직접 입력하세요.

// ===== 설정 변수 =====
const GITLAB_URL = 'https://your-gitlab.example.com'; // GitLab 서버 URL
const GITLAB_TOKEN = 'your-gitlab-private-token';      // GitLab Private Token

const REDMINE_URL = 'https://your-redmine.example.com'; // Redmine 서버 URL
const REDMINE_API_KEY = 'your-redmine-api-key';          // Redmine API Key
// =====================

// GitLab 프로젝트 목록 조회 (GET /api/v4/projects)
async function testGitlab() {
    console.log('=== GitLab API 테스트 ===');
    try {
        const response = await fetch(`${GITLAB_URL}/api/v4/projects`, {
            headers: {
                'PRIVATE-TOKEN': GITLAB_TOKEN,
            },
        });

        if (!response.ok) {
            console.error(`GitLab 오류: ${response.status} ${response.statusText}`);
            return;
        }

        const projects = await response.json();
        console.log(`프로젝트 수: ${projects.length}`);
        projects.slice(0, 3).forEach((p) => {
            console.log(`  - [${p.id}] ${p.name} (${p.path_with_namespace})`);
        });
    } catch (err) {
        console.error(`GitLab 연결 실패: ${err.message}`);
    }
}

// Redmine 프로젝트 목록 조회 (GET /projects.json)
async function testRedmine() {
    console.log('=== Redmine API 테스트 ===');
    try {
        const response = await fetch(`${REDMINE_URL}/projects.json`, {
            headers: {
                'X-Redmine-API-Key': REDMINE_API_KEY,
            },
        });

        if (!response.ok) {
            console.error(`Redmine 오류: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const projects = data.projects ?? [];
        console.log(`프로젝트 수: ${projects.length}`);
        projects.slice(0, 3).forEach((p) => {
            console.log(`  - [${p.id}] ${p.name} (${p.identifier})`);
        });
    } catch (err) {
        console.error(`Redmine 연결 실패: ${err.message}`);
    }
}

// 메인 실행
(async () => {
    await testGitlab();
    console.log();
    await testRedmine();
})();
