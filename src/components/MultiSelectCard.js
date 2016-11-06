import React from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';

const getSectionExperiment = (options, onChange, disable) => {
  return Object.keys(options)
    .sort()
    .map(name => {
      return (<Toggle
        style={{ marginLeft: 2 }}
        label={name}
        labelPosition="right"
        toggled={options[name]}
        onToggle={() => onChange(name)}
        key={name}
        disabled={disable}
      />);
    });
};

const MultiSelectCard = ({ style, title, subtitle = '', disableItems, initiallyExpanded = false, options, onToggleExperiment, columns = 3, children }) => {
  return (
    <Card style={style} initiallyExpanded={initiallyExpanded}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        actAsExpander
        showExpandableButton
      />
      <CardActions>
        {children}
      </CardActions>
      <CardText expandable>
        <div style={{ columnCount: columns }}>
          {getSectionExperiment(options, onToggleExperiment, disableItems)}
        </div>
      </CardText>
    </Card>);
};

const { PropTypes } = React;
MultiSelectCard.propTypes = {
  columns: PropTypes.number,
  disableItems: PropTypes.bool,
  initiallyExpanded: PropTypes.bool,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  options: PropTypes.object.isRequired,
  style: PropTypes.object,
  onToggleExperiment: PropTypes.func.isRequired,
  children: PropTypes.any,
};

export default MultiSelectCard;
