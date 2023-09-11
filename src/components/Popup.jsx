import Modal from "react-bootstrap/Modal";

const Popup = (props) => {
  const hidePopup = () => {
    props.setIsPopupOpen(false);
  };

  return (
    <div>
      <Modal show={props.isPopupOpen} onHide={hidePopup}>
        <Modal.Header>
          <Modal.Title>{props.popupTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.popupBody}</Modal.Body>
        <Modal.Footer>
          <button className="navigateButton" onClick={hidePopup}>
            {props.cancelText}
          </button>
          <button className="navigateButton" onClick={props.confirmAction}>
            {props.confirmText}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Popup;
