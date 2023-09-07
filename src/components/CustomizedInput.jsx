import { AD_CONTENT } from "../util/helperFunctions"
import { Slider } from '@mui/material'

export const YOUR_OWN_VOICE = "Your Own Voice";

const CustomizedInput = (props) => {
  return (
    <div className="customizedInputContainer">
      <h2>Customize generation</h2>

      <div className="customizedInputBlock">
        <h4>Podcast Title: </h4>
        <input
          type="text"
          value={props.podcastTitle}
          placeholder="e.g. Twitter Daily Newsletter"
          onChange={(e) => props.setPodcastTitle(e.target.value)}
          className="customizedInput"
        />
      </div>

      <div className="customizedInputBlock">
          <h4>Host Name: </h4>
          <input 
              type="text"
              placeholder="Zuzu"
              value={props.hostName}
              onChange={(e) => props.setHostName(e.target.value)}
              className="customizedInput"
          />
      </div>
          
      <div className="customizedInputBlock">
          <h4 style={{marginBottom: '0px'}}>Estimated Length: </h4>
          <p className="customizedInput" style={{marginBottom: '0px'}}>{props.totalLength} minutes</p>
      </div>
      <div className="customizedInputBlock" style={{marginTop: '0px'}}>
          <Slider
              value={props.totalLength}
              onChange={(event, value, activeThumb) => props.setTotalLength(value)}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={5}
              max={30}
              color="warning"
          />
      </div>

      <div className="customizedInputBlock">
        <h4>Ad: </h4>
        <input
          type="text"
          placeholder="Your ad to be inserted into the podcast..."
          value={AD_CONTENT}
          disabled={true}
          className="customizedInput"
          style={{ cursor: "not-allowed" }}
        />
      </div>
    </div>
  );
};

export default CustomizedInput;
