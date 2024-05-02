import { AccessTimeFilled } from '@mui/icons-material';
import styles from './DetailTestCase.module.css';
import { Box, Chip } from '@mui/material';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import Divider from '@mui/material/Divider';
import gfm from 'remark-gfm';
import { Fragment } from 'react';
import { _PROBLEM_LEVEL } from '~/utils/problem';

function DetailTestCase({ problem }) {
  const customComponents = {
    table: (props) => (
      <table style={{ borderCollapse: 'collapse' }}>{props.children}</table>
    ),
    th: (props) => {
      const value = props.children;
      if (!value) {
        return <th style={{ border: '1px solid black' }}></th>;
      }
      const data = value[0]?.split('\\hehe');
      return (
        <th
          style={{
            verticalAlign: 'top',
            padding: '6px 13px',
            border: '1px solid black',
          }}
        >
          {data &&
            data.map((item, index) => (
              <Fragment key={index}>
                {item}
                {index < data.length - 1 && <br />}
              </Fragment>
            ))}
        </th>
      );
    },
    td: (props) => {
      const value = props.children;
      if (!value) {
        return <td style={{ border: '1px solid black' }}></td>;
      }

      const data = value[0]?.split('\\hehe');
      return (
        <td
          style={{
            verticalAlign: 'top',
            padding: '6px 13px',
            border: '1px solid black',
          }}
        >
          {data &&
            data.map((item, index) => (
              <Fragment key={index}>
                {item}
                {index < data.length - 1 && <br />}
              </Fragment>
            ))}
        </td>
      );
    },
    p: (props) => <p style={{ lineHeight: '1.5' }}>{props.children}</p>,
  };

  return (
    <Box>
      <div className={styles.heading}>
        <div className={styles.headingLeft}>
          <h3
            style={{
              margin: '12px 0',
            }}
          >
            {problem.title}
          </h3>
          <Chip
            sx={{
              marginLeft: '4px',
            }}
            label={
              problem.level == _PROBLEM_LEVEL.EASY
                ? 'Easy'
                : problem.level == _PROBLEM_LEVEL.MEDIUM
                ? 'Medium'
                : 'Hard'
            }
          />
        </div>
        {problem.testTime && (
          <div className={styles.headingRight}>
            <Chip
              icon={<AccessTimeFilled />}
              label={problem.testTime + ' min'}
            />
          </div>
        )}
      </div>
      <ReactMarkdown
        components={customComponents}
        className={styles.descriptions}
        remarkPlugins={[gfm]}
      >
        {problem.desc}
      </ReactMarkdown>
      <Divider sx={{ mt: 2 }} />
      <Box>
        Time Limit: {problem.timeLimit} s
        <br />
        Memory Limit: {problem.memoryLimit} KB
        <br />
        Stack Limit: {problem.stackLimit} KB
      </Box>
    </Box>
  );
}

export default DetailTestCase;
