const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const responseEmitter = require('../utils/emitter');

async function fetchProblemData(problem_id) {
  const query = `
    SELECT *
    FROM
      problem p
    LEFT JOIN
      example e ON p.problem_id = e.problem_id
    WHERE
      p.problem_id = ?;
  `;

  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [problem_id]);

    if (results.length === 0) {
      return null;
    }

    const problem = {
      problem_id: results[0].problem_id,
      title: results[0].title,
      description: results[0].description,
      input: results[0].input,
      output: results[0].output,
      memory_limit: results[0].memory_limit,
      time_limit: results[0].time_limit,
      memory_balance: results[0].memory_balance,
      time_balance: results[0].time_balance,
      is_basic_format: results[0].is_basic_format,
      is_delete_white_space: results[0].is_delete_white_space,
      is_delete_blank_line: results[0].is_delete_blank_line,
      grade_guide: results[0].grade_guide,
      use_ai_grade: results[0].use_ai_grade,
      use_detect_hardcode: results[0].use_detect_hardcode,
      examples: [],
    };

    results.forEach(row => {
      if (row.example_id) {
        problem.examples.push({
          input_example: row.input_example,
          output_example: row.output_example,
        });
      }
    });

    return problem;
  } catch (err) {
    const customErrorMessage = `데이터베이스 쿼리 오류 - 문제 데이터 조회 실패: ${err.message}`;
    console.error(customErrorMessage);
    throw new Error(customErrorMessage);
  }
}

async function getProblemHandler(req, res) {
  const { problem_id } = req.params;
  if (!problem_id || isNaN(problem_id)) {
    return res.status(400).json({ error: '유효한 문제 ID가 필요합니다.' });
  }

  try {
    const problem = await fetchProblemData(problem_id);
    if (!problem) {
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }

    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProblemSetHandler(req, res) {
  const query = 'SELECT * FROM problem';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query);
    if (results.length === 0) {
      return res.status(404).json({ error: '문제 세트를 찾을 수 없습니다.' });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error('데이터베이스 쿼리 오류:', err);
    res.status(500).json({ error: '데이터베이스 쿼리 오류' });
  }
}

async function createProblemHandler(req, res) {
  const pool = await mysqlConnect();
  const mq = await rabbitConnect();

  try {
    const {
      title,
      description,
      input,
      output,
      examples,
      memory_limit,
      time_limit,
      memory_balance,
      time_balance,
      is_basic_format,
      is_delete_white_space,
      is_delete_blank_line,
      grade_guide,
      use_ai_grade,
      use_detect_hardcode,
      gradingData,
    } = req.body;

    // Insert problem data into the problem table
    await pool.query('START TRANSACTION');
    const [result] = await pool.query(
      `INSERT INTO problem (title, description, input, output, memory_limit, time_limit,
        memory_balance, time_balance, is_basic_format, is_delete_white_space,
        is_delete_blank_line, grade_guide, use_ai_grade, use_detect_hardcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        input,
        output,
        memory_limit,
        time_limit,
        memory_balance,
        time_balance,
        is_basic_format,
        is_delete_white_space,
        is_delete_blank_line,
        grade_guide,
        use_ai_grade,
        use_detect_hardcode,
      ]
    );

    const problem_id = result.insertId;
    for (const example of examples) {
      await pool.query(
        `INSERT INTO example (problem_id, input_example, output_example) VALUES (?, ?, ?)`,
        [problem_id, example.input_example, example.output_example]
      );
    }
    const message = JSON.stringify({'operation': 'create', 'problem_id': problem_id, 'data': gradingData});
    const channel = await mq.createChannel();
    const queue = config.send_queue;
    await channel.sendToQueue(queue, Buffer.from(message));
    channel.close();
    await pool.query('COMMIT');
    // Send response
    res.status(201).json({
      message: 'Problem created successfully',
      problem_id,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating problem:', error);
    res.status(500).json({
      message: 'Failed to create problem',
      error: error.message,
    });
  }
}

async function getUpdateProblemHandler(req, res) {
  console.log('업데이트 핸들러 실행');
  const { problem_id } = req.params;

  if (!problem_id || isNaN(problem_id)) {
    return res.status(400).json({ error: '유효한 문제 ID가 필요합니다.' });
  }
  try {
    // 문제 업데이트 로직 실행 (트랜잭션 시작, 문제 업데이트, 예제 삭제/삽입 등)

    // RabbitMQ 요청을 보내고 응답을 기다림
    const requestId = uuidv4();
    const message = JSON.stringify({ operation: 'update', problem_id, requestId });
    const mq = await rabbitConnect();
    const channel = await mq.createChannel();
    const queue = config.send_queue;
    await channel.sendToQueue(queue, Buffer.from(message));
    channel.close();
    console.log('Send requset. Requset ID:', requestId);
    // 응답을 기다리고 처리
    responseEmitter.once(requestId, async (externalData) => {
      console.log('Recive request. Request ID:', requestId);
      try {
        const data = await fetchProblemData(problem_id);
        console.log('gradedata:', externalData);
        res.status(200).json({
          message: 'Problem updated successfully',
          problem_id,
          data: {
            ...data,
            gradingData: externalData,
          },
        });
      } catch (err) {
        res.status(500).json({ error: 'Error fetching updated problem data' });
      }
    });
  } catch (error) {
    console.error('문제 업데이트 오류:', error);
    res.status(500).json({
      message: 'Failed to update problem',
      error: error.message,
    });
  }
}

async function updateProblemHandler(req, res) {
  const pool = await mysqlConnect();
  const { problem_id } = req.params;

  if (!problem_id || isNaN(problem_id)) {
    return res.status(400).json({ error: '유효한 문제 ID가 필요합니다.' });
  }

  try {
    const {
      title,
      description,
      input,
      output,
      examples,
      memory_limit,
      time_limit,
      memory_balance,
      time_balance,
      is_basic_format,
      is_delete_white_space,
      is_delete_blank_line,
      grade_guide,
      use_ai_grade,
      use_detect_hardcode,
      gradingData,
    } = req.body;

    // Start transaction
    await pool.query('START TRANSACTION');

    // Update problem data
    const [updateResult] = await pool.query(
      `UPDATE problem 
       SET title = ?, description = ?, input = ?, output = ?,
           memory_limit = ?, time_limit = ?, memory_balance = ?,
           time_balance = ?, is_basic_format = ?, is_delete_white_space = ?,
           is_delete_blank_line = ?, grade_guide = ?, use_ai_grade = ?,
           use_detect_hardcode = ?
       WHERE problem_id = ?`,
      [
        title,
        description,
        input,
        output,
        memory_limit,
        time_limit,
        memory_balance,
        time_balance,
        is_basic_format,
        is_delete_white_space,
        is_delete_blank_line,
        grade_guide,
        use_ai_grade,
        use_detect_hardcode,
        problem_id
      ]
    );

    if (updateResult.affectedRows === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }

    // Delete existing examples
    await pool.query('DELETE FROM example WHERE problem_id = ?', [problem_id]);

    // Insert new examples
    for (const example of examples) {
      await pool.query(
        `INSERT INTO example (problem_id, input_example, output_example) VALUES (?, ?, ?)`,
        [problem_id, example.input_example, example.output_example]
      );
    }
    await pool.query('COMMIT');

    res.status(200).json({
      message: 'Problem updated successfully',
      problem_id,
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating problem:', error);
    res.status(500).json({
      message: 'Failed to update problem',
      error: error.message,
    });
  }
}

module.exports = {
  getProblemHandler,
  getProblemSetHandler,
  createProblemHandler,
  getUpdateProblemHandler,
  updateProblemHandler
};
