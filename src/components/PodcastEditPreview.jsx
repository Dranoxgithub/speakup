import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line, RiDeleteBin6Fill } from 'react-icons/ri'
import { useState } from "react";

const PodcastEditPreview = (props) => {
  const [hoverPreviewBox, setHoverPreviewBox] = useState(false)
  const [hoverDelete, setHoverDelete] = useState(false)
  const navigate = useNavigate();
  
  const STATUS_MAPPING = {
    'script_pending': 'Generating script...',
    'script_success': 'Script ready',
    'script_failed': 'Script generation failed'
  }

  const navigateToEdit = () => {
    navigate(`/edit?contentId=${props.contentId}`, {
      state: {
        title: props.title,
        script: props.script,
        urls: props.urls,
      },
    });
  };

  return (
    <div className="previewContainer" onClick={navigateToEdit} onMouseEnter={() => setHoverPreviewBox(true)} onMouseLeave={() => setHoverPreviewBox(false)}>
      <p className="navigationHeaderText" style={{textAlign: 'initial', fontWeight: '500', fontSize: '24px', margin: '20px 20px', width: '100%'}}>{props.title}</p>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0px 20px', height: '35px'}}>
        <p className="navigationHeaderText" style={{fontWeight: '500', fontSize: '18px'}}>
          {STATUS_MAPPING[props.status]}
        </p>
        {hoverPreviewBox &&
          (hoverDelete ? 
            <RiDeleteBin6Fill 
              size={30} 
              color={'#2B1C50'} 
              onMouseEnter={() => setHoverDelete(true)} 
              onMouseLeave={() => setHoverDelete(false)} 
              onClick={(e) => {
                e.stopPropagation()
                props.deleteContent()
              }}
            /> : 
            <RiDeleteBin6Line size={30} color={'#2B1C50'} onMouseEnter={() => setHoverDelete(true)} onMouseLeave={() => setHoverDelete(false)} />
          )
        }
      </div>
    </div>
  );
};

export default PodcastEditPreview;
