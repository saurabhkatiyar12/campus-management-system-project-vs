const API_BASE_URL = globalThis.process?.env?.API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}, expectedStatus = 200) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status !== expectedStatus) {
    throw new Error(
      `${options.method || 'GET'} ${path} failed: expected ${expectedStatus}, got ${response.status}. Body: ${text}`
    );
  }

  return data;
}

async function login(email, password) {
  const data = await request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    },
    200
  );
  return data.token;
}

async function run() {
  console.log(`Running smoke test against ${API_BASE_URL}`);

  const adminToken = await login('admin@campus.edu', 'admin123');
  const facultyToken = await login('faculty@campus.edu', 'faculty123');
  const studentToken = await login('student@campus.edu', 'student123');
  console.log('Login checks passed');

  const users = await request(
    '/api/users',
    { headers: { Authorization: `Bearer ${adminToken}` } },
    200
  );

  const student = users.find(u => u.email === 'student@campus.edu');
  if (!student) {
    throw new Error('Seeded student user not found in /api/users');
  }
  console.log('Admin users endpoint check passed');

  const course = 'Smoke Test 101';
  const date = new Date().toISOString().slice(0, 10);

  await request(
    '/api/attendance',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        course,
        date,
        records: [{ studentId: student.id, studentName: student.name, status: 'present' }]
      })
    },
    201
  );

  const report = await request(
    `/api/attendance/report?course=${encodeURIComponent(course)}&month=${date.slice(0, 7)}`,
    { headers: { Authorization: `Bearer ${facultyToken}` } },
    200
  );
  if (!Array.isArray(report)) {
    throw new Error('Attendance report response is not an array');
  }
  console.log('Faculty attendance flow passed');

  await request(
    '/api/notices',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        title: `Smoke Notice ${Date.now()}`,
        content: 'Smoke test notice content',
        priority: 'normal',
        targetAudience: 'students'
      })
    },
    201
  );

  const assignmentResp = await request(
    '/api/assignments',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        title: `Smoke Assignment ${Date.now()}`,
        description: 'Smoke test assignment',
        course,
        dueDate: date
      })
    },
    201
  );
  const assignmentId = assignmentResp?.assignment?.id;
  if (!assignmentId) {
    throw new Error('Assignment creation response missing assignment.id');
  }
  console.log('Faculty notices/assignments flow passed');

  await request(
    `/api/assignments/${assignmentId}/submit`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ content: 'Smoke test student submission' })
    },
    200
  );

  const studentAttendance = await request(
    '/api/attendance',
    { headers: { Authorization: `Bearer ${studentToken}` } },
    200
  );
  if (!Array.isArray(studentAttendance)) {
    throw new Error('Student attendance response is not an array');
  }

  const studentAssignments = await request(
    '/api/assignments',
    { headers: { Authorization: `Bearer ${studentToken}` } },
    200
  );
  if (!Array.isArray(studentAssignments)) {
    throw new Error('Student assignments response is not an array');
  }

  const studentNotices = await request(
    '/api/notices',
    { headers: { Authorization: `Bearer ${studentToken}` } },
    200
  );
  if (!Array.isArray(studentNotices)) {
    throw new Error('Student notices response is not an array');
  }

  console.log('Student flow passed');
  console.log('Smoke test completed successfully.');
}

run().catch(error => {
  console.error(error.message);
  globalThis.process?.exit(1);
});
