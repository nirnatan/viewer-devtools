import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

const AutoCompleteWithAction = props => {
  return (
    <div>
      <AutoComplete
        floatingLabelText={props.floatingLabelText}
        filter={AutoComplete.caseInsensitiveFilter}
        dataSource={props.dataSource}
        onNewRequest={props.onNewRequest}
      />
      <FloatingActionButton
        mini
        onClick={props.onActionClicked}
      >
        <ContentAdd />
      </FloatingActionButton>
    </div>
  );
};

const { PropTypes } = React;
AutoCompleteWithAction.propTypes = {
  floatingLabelText: PropTypes.string.isRequired,
  dataSource: PropTypes.array.isRequired,
  onNewRequest: PropTypes.func.isRequired,
  onActionClicked: PropTypes.func.isRequired,
};

export default AutoCompleteWithAction;
