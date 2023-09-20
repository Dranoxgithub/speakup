import { useNavigate } from "react-router-dom";

const PodcastEditPreview = (props) => {
  const navigate = useNavigate();

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
    <div className="previewContainer" onClick={navigateToEdit}>
      <h2 style={{ margin: "0px" }}>{props.title}</h2>
      {props.audioUrl ? (
        <video controls name="podcast" className="audioPlayer">
          <source src={props.audioUrl} type="audio/mp3" />
        </video>
      ) : props.status == "failed" ? (
        <h2 className="generatingText" style={{ color: "red" }}>
          🚨 Failed
        </h2>
      ) : (
        <h2 className="generatingText">Generating...</h2>
      )}
    </div>
  );
};

export default PodcastEditPreview;
