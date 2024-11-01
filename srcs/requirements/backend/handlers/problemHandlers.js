const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');
async function getProblemHandler(req, res) {
  const { problem_id } = req.params;
  if (!problem_id || isNaN(problem_id)) {
    return res.status(400).json({ error: '유효한 문제 ID가 필요합니다.' });
  }

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
    const [results] = await pool.query(query, [problem_id]); // need exception
    if (results.length === 0) {
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }

    const problem = {
      problem_id: results[0].problem_id,
      title: results[0].title,
      description: results[0].description,
      input: results[0].input,
      output: results[0].output,
      memory_limit: results[0].memory_limit,
      time_limit: results[0].time_limit,
      examples: []
    };

    results.forEach(row => {
      if (row.example_id) {
        problem.examples.push({
          example_id: row.example_id,
          input_example: row.input_example,
          output_example: row.output_example
        });
      }
    });

    res.status(200).json(problem);
  } catch (err) {
    console.error('데이터베이스 쿼리 오류:', err);
    res.status(500).json({ error: '데이터베이스 쿼리 오류' });
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
        [problem_id, example.input, example.output]
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

module.exports = {
  getProblemHandler,
  getProblemSetHandler,
  createProblemHandler
};
