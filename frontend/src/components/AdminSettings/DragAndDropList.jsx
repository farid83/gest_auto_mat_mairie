import React from 'react';

// Utilise une lib comme react-beautiful-dnd pour le vrai drag-and-drop
const DragAndDropList = ({ items, onOrderChange, children }) => (
  <div>
    {items.map(item => (
      <div key={item.id}>{children(item)}</div>
    ))}
    {/* Ajoute ici la logique drag-and-drop réelle si besoin */}
  </div>
);

export default DragAndDropList;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\DragAndDropList.jsx