import React from 'react';
import Chip from 'material-ui/Chip';

const styles = {
  chipContainer: { display: 'flex', flexWrap: 'wrap', marginBottom: 20 },
  chip: { margin: 4 },
};

const renderChip = (item, handleRequestDelete) => (
  <Chip
    key={item}
    onRequestDelete={() => handleRequestDelete(item)}
    style={styles.chip}
  >
    {item}
  </Chip>
);

const Chips = ({ items, onRequestDelete }) => {
  if (items.length === 0) {
    return <div />;
  }

  return (
    <div style={styles.chipContainer}>
      {items.map(item => renderChip(item, onRequestDelete))}
    </div>
  );
};

const { PropTypes } = React;
Chips.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRequestDelete: PropTypes.func.isRequired,
};

export default Chips;
