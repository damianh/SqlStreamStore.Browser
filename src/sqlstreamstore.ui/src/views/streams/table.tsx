import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { makeStyles } from '@material-ui/core';
import { Stream } from './models';

interface Props {
  streams: Stream[];
}

const useStyles = makeStyles({
  tableHeader: {
    padding: 10,
  },
  actionColumn: {
    width: 30,
  }
});

const StreamsTable = (props: Props) => {
  const classes = useStyles();
  return (

    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="streams table" size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.actionColumn}></TableCell>
            <TableCell>Created UTC</TableCell>
            <TableCell>Stream ID</TableCell>
            <TableCell>Message ID</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Position</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.streams.map(s => (
            <TableRow key={s.messageId}>
              <TableCell component="th" scope="row" className={classes.actionColumn}>
                <IconButton
                  aria-label="open stream"
                >
                  <OpenInBrowserIcon />
                </IconButton>
              </TableCell>
              <TableCell component="th" scope="row">
                {new Date(s.createdUtc).toLocaleString()}
              </TableCell>
              <TableCell>{s.streamId}</TableCell>
              <TableCell>{s.messageId}</TableCell>
              <TableCell>{s.streamVersion}</TableCell>
              <TableCell>{s.position}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
};

export default StreamsTable;
