import React, { useState, useEffect } from 'react';
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom';
import Searchbar from '../../components/Searchbar/searchbar';
import ProgressIndicator from '../../components/progressIndicator';
import { makeStyles } from '@material-ui/core';
import ErrorMessage from '../../components/errorMessage';
import StreamsTable from './table';
import MessageDrawer from './drawer';
import { getHalClient } from '../../services/hal';
import { HalResource } from 'hal-rest-client';
import usePrevious from '../../components/hooks/usePrevious'

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
  searchContainer: {
    padding: '10px 0',
  },
});

const StreamsView = () => {
  const classes = useStyles();
  const history = useHistory();
  const params = useParams<{ streamId: string, version: string }>();
  const [halResponse, updateHalResponse] = useState<HalResource>();
  const [messages, updateMessages] = useState<HalResource[]>([]);
  const [status, updateStatus] = useState('loading');
  const previousStreamId = usePrevious(params.streamId);
  const halClient = getHalClient();
  const routeMatch = useRouteMatch();
  const queryStrings = useLocation().search;
  
  useEffect(() => {
    async function retrieveStreams() {
      try {
        if (!params.streamId || params.streamId !== previousStreamId) {
          updateStatus('loading');
          const fetchHalResponse = await halClient.fetchResource(`.${routeMatch.url}${queryStrings}`);
          const streamStoreMessage = fetchHalResponse.prop('streamStore:message');
          if (streamStoreMessage instanceof HalResource) {
            const streamsHalResource = await halClient.fetchResource(streamStoreMessage.link('streamStore:feed').uri.uri);
            updateMessages(streamsHalResource.prop('streamStore:message'));
          } else {
            updateMessages(streamStoreMessage);
          }
          updateHalResponse(fetchHalResponse);
          updateStatus('done');
        }
      } catch (err) {
        console.error(err);
        updateStatus('error');
      }
    }

    retrieveStreams();
  }, [params, routeMatch, halClient, queryStrings, previousStreamId]);

  const onDrawerCloseButtonClicked = () => {
    if (halResponse) {
      console.log('../../' + halResponse.link('streamStore:feed').uri.uri);
      history.push('../' + halResponse.link('streamStore:feed').uri.uri);
    }
  };

  return (
    <div className={classes.root}>

      {
        (status === 'loading') ? <ProgressIndicator /> : null
      }
      {
        (status === 'error') ? <ErrorMessage message="An error occured while retrieving streams" /> : null
      }
      {
        (status === 'done' && halResponse) ?
          <div>
            <div className={classes.searchContainer}>
              <Searchbar
                halLinks={halResponse.links}
                fromPosition={halResponse.prop('fromPosition')}
              />
            </div>
            <StreamsTable streams={messages} />
          </div> : null
      }
      <MessageDrawer
        onCloseButtonClicked={onDrawerCloseButtonClicked}
        version={params.version}
      />
    </div>
  );
};

export default StreamsView;
