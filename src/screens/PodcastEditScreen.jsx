import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { getAuth } from "@firebase/auth";
import UserInfoDisplay from "../components/UserInfoDisplay";
import { updateDocument } from "../util/firebaseUtils";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";

const PodcastEditScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = useAppSelector(getUserId);
  const [contentId, setContentId] = useState();
  const [title, setTitle] = useState();
  const [intro, setIntro] = useState();
  const [outro, setOutro] = useState();
  const [bodyParas, setBodyParas] = useState([]);
  const [error, setError] = useState();
  const [fetchingUser, setFetchingUser] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleTextareaChange = (event) => {
    const currentBody = [...bodyParas];
    currentBody[event.target.name] = event.target.value;
    setBodyParas(currentBody);
  };

  const savePodcastEdit = async () => {
    const bodyParasString = bodyParas.join("\n\n");
    const scriptString =
      intro + "<br>" + bodyParas.join("<br><br>") + "<br>" + outro;
    await updateDocument("contents", contentId, {
      result: {
        script: {
          intro: intro,
          paragraphs: [bodyParasString],
          outro: outro,
          best_summary: scriptString,
        },
      },
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (queryParams.has("contentId")) {
        setFetchingUser(false);
        return;
      }

      const app = initializeFirebaseApp();
      const auth = getAuth(app);
      if (!auth.currentUser) {
        navigate("/login", {
          replace: true,
          state: {
            contentId: queryParams.has("contentId")
              ? queryParams.get("contentId")
              : null,
          },
        });
      }
      setFetchingUser(false);
    }, 500);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const modalContent = document.querySelector(".profileDetailBox");
      if (modalContent && !modalContent.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [showModal]);

  useEffect(() => {
    const processSnapshot = async (doc) => {
      const content = doc.data();
      if (content) {
        setTitle(content.original_content.title);
        if (content.result) {
          if (content.result.script.intro) {
            setIntro(content.result.script.intro);
          }
          if (content.result.script.outro) {
            setOutro(content.result.script.outro);
          }
          if (content.result.script.paragraphs) {
            setBodyParas([
              ...content.result.script.paragraphs[0].split("\n\n"),
            ]);
          }
        }
      }
    };

    const populateContentFromQueryParams = async (contentId) => {
      console.log("getting from database with snapshot" + contentId);

      //   const content = await getDocument("contents", contentId);
      const app = initializeFirebaseApp();
      const db = getFirestore(app);
      onSnapshot(doc(db, "contents", contentId), async (doc) => {
        await processSnapshot(doc);
      });
    };

    const populateContent = async () => {
      if (queryParams.has("contentId")) {
        const contentId = queryParams.get("contentId");
        setContentId(contentId);
        const user = await getDocument("users", userId);
        if (
          user &&
          user.user_saved &&
          user.user_saved.filter((item) => item.content_id == contentId)
            .length > 0
        ) {
          populateContentFromQueryParams(contentId);
          console.log(`populated content from query params`);
        } else {
          console.log(`setting error to no permission`);
          setError(`Sorry, you don't have permission to view the content :(`);
        }
      }
    };

    if (userId && location) {
      populateContent();
    }
  }, [location, userId]);

  const goBackToDashboard = () => {
    navigate("/Dashboard", { replace: true });
  };

  return (
    <div>
      {fetchingUser ? (
        <></>
      ) : (
        <div className="resultContainer">
          {
            <div className="headerContainer">
              <div className="backNavigator" onClick={goBackToDashboard}>
                <AiOutlineArrowLeft size={25} style={{ marginRight: 10 }} />
                <h2 style={{ margin: "0px" }}>Dashboard</h2>
              </div>
              <UserInfoDisplay
                showModal={showModal}
                setShowModal={setShowModal}
              />
            </div>
          }

          {error ? (
            <h2>{error}</h2>
          ) : (
            <div className="container">
              <h2 className="title">Edit </h2>
              <div className="contentRow"></div>

              {intro && (
                <textarea
                  value={intro}
                  onChange={(e) => {
                    setIntro(e.target.value);
                  }}
                  className="urlInput"
                />
              )}

              {bodyParas &&
                bodyParas.map((item, index) => (
                  <textarea
                    value={item}
                    key={index}
                    name={index}
                    onChange={handleTextareaChange}
                    className="urlInput"
                  />
                ))}

              {outro && (
                <textarea
                  value={outro}
                  onChange={(e) => {
                    setOutro(e.target.value);
                  }}
                  className="urlInput"
                />
              )}

              <div className="tabContainer">
                <button
                  className="navigateButton activeTab"
                  onClick={savePodcastEdit}
                >
                  <p className="buttonText">Save Draft</p>
                </button>
                <button
                  className="navigateButton activeTab"
                  // onClick={generateAudio}
                >
                  <p className="buttonText">Generate podcast</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastEditScreen;
