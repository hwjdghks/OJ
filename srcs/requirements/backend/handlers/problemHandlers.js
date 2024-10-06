const mysqlConnect = require('../config/db');

async function getProblemHandler(req, res) {
  const { problem_id } = req.params;
  if (!problem_id) {
    return res.status(400).json({ error: '문제 ID가 필요합니다.' });
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

    res.json(problem);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}


async function getProblemSetHandler(req, res) {
  const query = 'SELECT * FROM problem';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query); // nned excepiton
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}

module.exports = {
  getProblemHandler,
  getProblemSetHandler
};
