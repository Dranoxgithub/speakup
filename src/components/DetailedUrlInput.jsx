import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import {
  generatePodcast,
  checkWordCount,
  AD_CONTENT,
} from "../util/helperFunctions";
import { getAuth } from "@firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { YOUR_OWN_VOICE } from "./VoiceSettings";
import Popup from "../components/Popup";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { AVAILABLE_VOICES, getUserVoicePreviewAudio } from "../util/voice";
import { getStorage, ref, getBlob } from "@firebase/storage";
import UpgradePlanAlert from "./UpgradePlanAlert";
import GenerateAudioSettings from "./GenerateAudioSettings";
import CreateInfoHelper from "./CreateInfoHelper";
import * as amplitude from "@amplitude/analytics-browser";

export const AVAILABLE_LANGUAGES = [
  { name: 'English', script: "I want SpeakUp AI to create an artificial version of my voice that I can user to create speech that sounds like me. I am training my voice by reading the following statement:\n\nOn Earth, everyone has their own voice. It's like having a special sound that no one else has. We use our voices to tell stories, share ideas, and make beautiful things.\n\nIn a small town, there was a group of friends who loved to tell stories. They would sit under a big tree and each would tell a story using their voice. One friend had a voice that was deep and strong, like a drum. Another had a voice that was light and cheerful, like a bird singing in the morning.\n\nOne day, they decided to use their voices to make something special. They wanted to show how different voices can come together to create something beautiful. They started to plan a big show for their town.\n\nEach friend wrote a part of the story. They practiced speaking clearly and loudly so everyone could hear. They used their voices to make the characters in the story come to life. Some parts of the story were funny and made people laugh. Other parts were serious and made people think.\n\nOn the day of the show, people from all over the town came to listen. The friends stood under the big tree and started to tell their story. Each voice was different, but together they sounded amazing. People clapped and smiled as they listened.\n\nAnd from that day on, the friends met under the tree every week to tell new stories. They learned that every voice is important and that together, they can make the world a more interesting and beautiful place."  },
  { name: 'Japanese', script: "スピークアップAIに私の声の人工バージョンを作成してもらいたいです。それを使って、私の声のように聞こえるスピーチを作成できるようになります。以下の声明を読むことで、私の声をトレーニングしています。\n\n地球には、それぞれ独自の声があります。まるで他にはない特別なサウンドを持っているようなものです。私たちは声を使って物語を語ったり、アイデアを共有したり、美しいものを作り出したりします。\n\n小さな町に、物語を語るのが好きな友達のグループがいました。彼らは大きな木の下に集まり、それぞれが自分の声を使って物語を語りました。ある友達の声は深く強く、太鼓のようでした。別の友達の声は軽やかで明るく、朝の鳥のさえずりのようでした。\n\nある日、彼らは声を使って特別なものを作り出すことにしました。異なる声が集まって美しいものを作り出せることを示したいと思いました。町の人たちに大きなショーを計画し始めました。\n\nそれぞれの友達が物語の一部を書きました。はっきりと大きな声で話せるように練習して、誰もが聞こえるようにしました。彼らの声を使って、物語の登場人物を生き生きとさせました。物語の中には面白い部分があり、人々を笑わせました。また、真面目な部分もあり、人々に考えさせました。\n\nショーの日には、町中から人々が聞きに来ました。友達は大きな木の下に立ち、物語を語り始めました。それぞれの声は異なっていましたが、一緒になると素晴らしく響きました。人々は拍手を送りながら微笑んで聞き入りました。\n\nそしてその日から、友達は毎週木の下で集まり、新しい物語を語りました。それぞれの声が重要であること、そして一緒になると、もっと興味深く美しい世界を作り出せることを学びました。" },
  { name: 'Chinese', script: "我希望SpeakUp AI能够创造一个我声音的人工版本，这样我就可以用它来制造出听上去像是我的语音。我正在通过阅读以下陈述来训练我的声音：\n\n在地球上，每个人都有自己的声音。这就像拥有别人没有的特殊的声响。我们用我们的声音来讲故事、分享想法和创造美好的事物。\n\n在一个小镇上，有一群喜欢讲故事的朋友们。他们会坐在一棵大树下，每个人用自己的声音讲一个故事。一个朋友的声音深沉有力，就像鼓声。另一个朋友的声音轻快愉悦，像是清晨鸟儿的歌唱。\n\n有一天，他们决定用自己的声音来创造一些特别的东西。他们想要展示不同的声音如何能聚合在一起创造出美妙的东西。他们开始为小镇策划一场大型演出。\n\n每个朋友写了故事的一部分。他们练习清晰和响亮地说话，以便每个人都能听到。他们用自己的声音使故事中的角色栩栩如生。故事的一些部分很有趣，让人们笑了。而其他部分则很严肃，让人们深思。\n\n在演出当天，来自小镇各地的人们都来聆听。朋友们站在大树下开始讲故事。每个人的声音都不同，但是当他们一起发声时，听起来却非常惊人。人们在聆听时鼓掌并微笑。\n\n从那一天起，朋友们每周都会在树下聚会，讲新的故事。他们了解到每个人的声音都很重要，而且一起，他们可以让世界变得更加有趣和美丽。" },
  { name: 'German', script: "Ich möchte, dass SpeakUp AI eine künstliche Version meiner Stimme erstellt, die ich verwenden kann, um Sprache zu erzeugen, die wie ich klingt. Ich trainiere meine Stimme, indem ich die folgende Aussage lese:\n\nAuf der Erde hat jeder seine eigene Stimme. Es ist, als hätte man einen speziellen Klang, den niemand anderes hat. Wir benutzen unsere Stimmen, um Geschichten zu erzählen, Ideen zu teilen und schöne Dinge zu schaffen.\n\nIn einer kleinen Stadt gab es eine Gruppe von Freunden, die es liebten, Geschichten zu erzählen. Sie würden unter einem großen Baum sitzen und jeder würde eine Geschichte mit seiner Stimme erzählen. Ein Freund hatte eine Stimme, die tief und stark war, wie eine Trommel. Ein anderer hatte eine Stimme, die leicht und fröhlich war, wie ein Vogel, der am Morgen singt.\n\nEines Tages beschlossen sie, ihre Stimmen zu nutzen, um etwas Besonderes zu schaffen. Sie wollten zeigen, wie verschiedene Stimmen zusammenkommen können, um etwas Schönes zu erschaffen. Sie begannen, eine große Aufführung für ihre Stadt zu planen.\n\nJeder Freund schrieb einen Teil der Geschichte. Sie übten, klar und laut zu sprechen, damit jeder zuhören konnte. Sie nutzten ihre Stimmen, um die Charaktere in der Geschichte zum Leben zu erwecken. Einige Teile der Geschichte waren lustig und brachten die Leute zum Lachen. Andere Teile waren ernst und brachten die Leute zum Nachdenken.\n\nAm Tag der Aufführung kamen Menschen aus der ganzen Stadt, um zuzuhören. Die Freunde standen unter dem großen Baum und begannen, ihre Geschichte zu erzählen. Jede Stimme war anders, aber zusammen klangen sie erstaunlich. Die Leute klatschten und lächelten, während sie zuhörten.\n\nUnd von diesem Tag an trafen sich die Freunde jede Woche unter dem Baum, um neue Geschichten zu erzählen. Sie lernten, dass jede Stimme wichtig ist und dass sie gemeinsam die Welt zu einem interessanteren und schöneren Ort machen können." },
  { name: 'Hindi', script: "मैं चाहता हूँ कि SpeakUp AI मेरी आवाज़ का एक कृत्रिम संस्करण बनाए, जिसे मैं ऐसे भाषण बनाने के लिए उपयोग कर सकूँ जो मेरी तरह लगे। मैं निम्न वक्तव्य पढ़कर अपनी आवाज़ का अभ्यास कर रहा हूँ: \n\nपृथ्वी पर, हर कोई अपनी अनूठी आवाज़ होती है। यह एक ख़ास ध्वनि की तरह है जो किसी और के पास नहीं होती। हम अपनी आवाजों का उपयोग कहानियां सुनाने, विचारों को साझा करने और सुंदर चीज़ें बनाने के लिए करते हैं।\n\nएक छोटे शहर में, कुछ दोस्त थे जिन्हें कहानियां सुनाना बहुत पसंद था। वे एक बड़े पेड़ के नीचे बैठते और हर कोई अपनी आवाज़ का उपयोग करके एक कहानी सुनाता। एक दोस्त की आवाज़ गहरी और मजबूत थी, बिल्कुल ढोल की तरह। एक और की आवाज़ हल्की और खुशीली थी, जैसे सुबह में चिड़िया का गाना।\n\nएक दिन, उन्होंने फैसला किया कि वे अपनी आवाजों का उपयोग करके कुछ ख़ास बनाएँगे। वे दिखाना चाहते थे कि अलग-अलग आवाज़ें कैसे एक साथ मिलकर कुछ सुंदर बना सकती हैं। उन्होंने अपने शहर के लिए एक बड़ा कार्यक्रम तैयार करना शुरू किया।\n\nहर दोस्त ने कहानी का एक हिस्सा लिखा। वे साफ़ और ऊँची आवाज़ में बोलने का अभ्यास करते ताकि सभी सुन सकें। उन्होंने अपनी आवाजों का उपयोग कहानी के पात्रों को जीवंत करने के लिए किया। कहानी के कुछ हिस्से मजेदार थे और लोगों को हंसाए। कुछ गंभीर हिस्से थे जिन्होंने लोगों को सोचने पर मजबूर किया।\n\nकार्यक्रम के दिन, शहर भर के लोग सुनने के लिए आए। दोस्त पेड़ के नीचे खड़े हो गए और अपनी कहानी सुनाना शुरू किया। हर आवाज़ अलग थी, लेकिन मिलकर वे अद्भुत लग रहे थे। लोग तालियाँ बजाते और मुस्कुराते हुए सुन रहे थे। \n\nऔर उस दिन से, दोस्त हर हफ्ते पेड़ के नीचे नई कहानियां सुनाने के लिए मिलते। उन्होंने सीखा कि हर आवाज़ महत्वपूर्ण है और साथ में, वे दुनिया को एक और अधिक दिलचस्प और सुंदर जगह बना सकते हैं।" },
  { name: 'French', script: "Je souhaite que SpeakUp AI crée une version artificielle de ma voix que je peux utiliser pour créer des discours qui sonnent comme moi. Je forme ma voix en lisant le texte suivant :\n\nSur Terre, chacun possède sa propre voix. C'est comme avoir un son spécial que personne d'autre n'a. Nous utilisons nos voix pour raconter des histoires, partager des idées et créer de belles choses.\n\nDans une petite ville, il y avait un groupe d'amis qui adorait raconter des histoires. Ils se rassemblaient sous un grand arbre et chacun racontait une histoire avec sa voix. Un ami avait une voix profonde et forte, comme un tambour. Un autre avait une voix légère et joyeuse, comme un oiseau qui chante le matin.\n\nUn jour, ils décidèrent d'utiliser leurs voix pour créer quelque chose de spécial. Ils voulaient montrer comment des voix différentes peuvent se réunir pour créer quelque chose de beau. Ils commencèrent à planifier un grand spectacle pour leur ville.\n\nChaque ami écrivit une partie de l'histoire. Ils s'exercèrent à parler clairement et fort pour que tout le monde puisse entendre. Ils utilisaient leurs voix pour donner vie aux personnages de l'histoire. Certaines parties de l'histoire étaient drôles et faisaient rire les gens. D'autres étaient sérieuses et faisaient réfléchir.\n\nLe jour du spectacle, des gens de toute la ville vinrent écouter. Les amis se tenaient sous le grand arbre et commencèrent à raconter leur histoire. Chaque voix était différente, mais ensemble, elles sonnaient merveilleusement bien. Les gens applaudissaient et souriaient en écoutant.\n\nEt à partir de ce jour, les amis se retrouvaient sous l'arbre chaque semaine pour raconter de nouvelles histoires. Ils comprirent que chaque voix est importante et que, ensemble, ils peuvent rendre le monde plus intéressant et plus beau." },
  { name: 'Korean', script: "제가 SpeakUp AI로 인공적인 내 목소리를 만들어서 그 목소리로 진짜 제가 말하는 것처럼 들리는 연설을 만들고 싶어요. 목소리 훈련을 위해 다음과 같은 문장을 읽고 있습니다:\n\n지구상에는 모든 사람이 자신만의 목소리를 갖고 있습니다. 마치 세상에 단 하나뿐인 특별한 소리를 갖고 있는 것과 같죠. 우리는 목소리를 사용해서 이야기를 들려주고, 아이디어를 나누며, 아름다운 것들을 만들어냅니다.\n\n작은 마을에는 이야기하는 것을 좋아하는 친구들의 모임이 있었습니다. 그들은 큰 나무 아래에 모여서 각자의 목소리로 이야기를 나누며 보냈습니다. 한 친구는 마치 북처럼 깊고 강한 목소리를 가졌고, 또 다른 친구는 아침에 새가 지저귀는 것처럼 가볍고 명랑한 목소리를 가졌습니다.\n\n어느 날, 그들은 자신들의 목소리를 사용해 특별한 것을 만들고 싶다는 결심을 했습니다. 다양한 목소리가 함께 어우러져 아름다운 것을 만들어 낼 수 있다는 것을 보여주고 싶었습니다. 그래서 그들은 마을을 위한 큰 공연을 계획하기 시작했습니다.\n\n각자 친구들은 이야기의 한 부분을 썼습니다. 모두가 잘 들을 수 있도록 분명하고 크게 말하기 연습을 했습니다. 그들은 목소리를 사용해서 이야기 속 캐릭터들을 생생하게 만들어냈습니다. 이야기의 어떤 부분은 사람들을 웃게 했고, 다른 부분은 사람들이 생각에 잠기게 만들었습니다.\n\n공연의 날, 마을 곳곳에서 사람들이 모여 듣기 위해 왔습니다. 친구들은 큰 나무 아래 서서 자신들의 이야기를 시작했습니다. 각기 다른 목소리였지만 함께 어우러져 놀라울 정도로 멋진 소리를 냈습니다. 사람들은 박수를 치며 환하게 웃으며 들었습니다.\n\n그 날 이후로, 친구들은 매주 나무 아래에서 새로운 이야기를 들려주기 위해 만났습니다. 그들은 모든 목소리가 중요하며, 함께하면 세상을 더 흥미롭고 아름답게 만들 수 있다는 것을 깨달았습니다." },
  { name: 'Portuguese', script: "Eu quero que o SpeakUp AI crie uma versão artificial da minha voz que eu possa usar para criar falas que soem como eu. Estou treinando minha voz lendo a seguinte declaração:\n\nNa Terra, cada pessoa tem sua própria voz. É como ter um som especial que ninguém mais possui. Usamos nossas vozes para contar histórias, compartilhar ideias e fazer coisas belas.\n\nEm uma pequena cidade, havia um grupo de amigos que adorava contar histórias. Eles se sentavam sob uma grande árvore e cada um contava uma história usando sua voz. Um amigo tinha uma voz profunda e forte, como um tambor. Outro tinha uma voz leve e alegre, como um pássaro cantando pela manhã.\n\nUm dia, eles decidiram usar suas vozes para fazer algo especial. Queriam mostrar como vozes diferentes podem se juntar para criar algo belo. Começaram a planejar um grande espetáculo para a sua cidade.\n\nCada amigo escreveu uma parte da história. Eles praticaram falando de forma clara e alta para que todos pudessem ouvir. Usaram suas vozes para dar vida aos personagens da história. Algumas partes da história eram engraçadas e faziam as pessoas rirem. Outras partes eram sérias e faziam as pessoas pensarem.\n\nNo dia do espetáculo, pessoas de toda a cidade vieram ouvir. Os amigos se posicionaram sob a grande árvore e começaram a contar sua história. Cada voz era diferente, mas juntas soavam incríveis. As pessoas aplaudiram e sorriram enquanto ouviam.\n\nE a partir daquele dia, os amigos se encontravam sob a árvore toda semana para contar novas histórias. Eles aprenderam que cada voz é importante e que juntas, podem tornar o mundo um lugar mais interessante e belo." },
  { name: 'Italian', script: "Voglio che SpeakUp AI crei una versione artificiale della mia voce che io possa usare per creare discorsi che suonino come se fossero pronunciati da me. Sto addestrando la mia voce leggendo la seguente affermazione:\n\nSulla Terra, ognuno ha la propria voce. È come avere un suono speciale che nessun altro possiede. Usiamo le nostre voci per raccontare storie, condividere idee e creare cose meravigliose.\n\nIn un piccolo paese, c'era un gruppo di amici che amava raccontare storie. Si sedevano sotto un grande albero e ognuno raccontava una storia usando la propria voce. Un amico aveva una voce profonda e forte, come un tamburo. Un altro aveva una voce leggera e gioiosa, come un uccello che canta al mattino.\n\nUn giorno, decisero di usare le loro voci per creare qualcosa di speciale. Volevano mostrare come voci diverse potessero unirsi per creare qualcosa di bello. Iniziarono a pianificare un grande spettacolo per il loro paese.\n\nOgni amico scrisse una parte della storia. Si esercitarono a parlare chiaramente e ad alta voce affinché tutti potessero ascoltare. Usarono le loro voci per dare vita ai personaggi della storia. Alcune parti della storia erano divertenti e facevano ridere le persone. Altre parti erano serie e facevano pensare.\n\nIl giorno dello spettacolo, persone da tutto il paese vennero ad ascoltare. Gli amici si misero in piedi sotto il grande albero e iniziarono a raccontare la loro storia. Ogni voce era diversa, ma insieme suonavano incredibili. La gente applaudì e sorrise mentre ascoltava.\n\nE da quel giorno in poi, gli amici si incontrarono sotto l'albero ogni settimana per raccontare nuove storie. Impararono che ogni voce è importante e che insieme possono rendere il mondo un posto più interessante e bello." },
  { name: 'Spanish', script: "Quiero que SpeakUp AI cree una versión artificial de mi voz que pueda utilizar para crear discursos que suenen como yo. Estoy entrenando mi voz leyendo el siguiente enunciado:\n\nEn la Tierra, cada persona tiene su propia voz. Es como tener un sonido especial que nadie más tiene. Usamos nuestras voces para contar historias, compartir ideas y crear cosas hermosas.\n\nEn un pequeño pueblo, había un grupo de amigos a los que les encantaba contar historias. Se sentaban bajo un gran árbol y cada uno contaba una historia usando su voz. Uno de los amigos tenía una voz profunda y fuerte, como un tambor. Otro tenía una voz ligera y alegre, como un pájaro cantando por la mañana.\n\nUn día, decidieron usar sus voces para hacer algo especial. Querían mostrar cómo las diferentes voces pueden unirse para crear algo hermoso. Comenzaron a planificar un gran espectáculo para su pueblo.\n\nCada amigo escribió una parte de la historia. Practicaron hablar de manera clara y fuerte para que todos pudieran oír. Usaron sus voces para dar vida a los personajes de la historia. Algunas partes de la historia eran divertidas e hicieron reír a la gente. Otras partes eran serias e hicieron pensar a las personas.\n\nEl día del espectáculo, gente de todo el pueblo vino a escuchar. Los amigos se pusieron bajo el gran árbol y comenzaron a contar su historia. Cada voz era diferente, pero juntas sonaban increíbles. La gente aplaudió y sonrió al escuchar.\n\nY desde ese día, los amigos se reunieron bajo el árbol cada semana para contar nuevas historias. Aprendieron que cada voz es importante y que juntas, pueden hacer del mundo un lugar más interesante y hermoso." },
  { name: 'Indonesian', script: "Saya ingin SpeakUp AI membuat versi suara buatan saya yang bisa saya gunakan untuk menciptakan ucapan yang terdengar seperti saya. Saya sedang melatih suara saya dengan membacakan pernyataan berikut:\n\nDi Bumi, setiap orang memiliki suaranya sendiri. Itu seperti memiliki suara khusus yang tidak dimiliki orang lain. Kita menggunakan suara kita untuk menceritakan kisah, berbagi ide, dan membuat hal-hal indah.\n\nDi sebuah kota kecil, ada sebuah kelompok teman yang suka bercerita. Mereka akan duduk di bawah pohon besar dan masing-masing akan bercerita menggunakan suaranya. Seorang teman memiliki suara yang dalam dan kuat, seperti drum. Teman lainnya memiliki suara yang ringan dan ceria, seperti burung yang bernyanyi di pagi hari.\n\nSuatu hari, mereka memutuskan untuk menggunakan suara mereka untuk membuat sesuatu yang spesial. Mereka ingin menunjukkan bagaimana suara yang berbeda bisa bersatu untuk menciptakan sesuatu yang indah. Mereka mulai merencanakan pertunjukan besar untuk kota mereka.\n\nSetiap teman menulis bagian dari cerita itu. Mereka berlatih berbicara dengan jelas dan keras sehingga semua orang bisa mendengar. Mereka menggunakan suara mereka untuk menghidupkan karakter dalam cerita. Beberapa bagian cerita lucu dan membuat orang tertawa. Bagian lain serius dan membuat orang berpikir.\n\nPada hari pertunjukan, orang-orang dari seluruh kota datang untuk mendengarkan. Para teman berdiri di bawah pohon besar dan mulai menceritakan kisah mereka. Setiap suara berbeda, namun bersama mereka terdengar luar biasa. Orang-orang bertepuk tangan dan tersenyum saat mereka mendengarkan.\n\nDan sejak hari itu, para teman bertemu di bawah pohon setiap minggu untuk menceritakan kisah baru. Mereka belajar bahwa setiap suara itu penting dan bahwa bersama-sama, mereka bisa membuat dunia menjadi tempat yang lebih menarik dan indah." },
  { name: 'Dutch', script: "Ik wil dat SpeakUp AI een kunstmatige versie van mijn stem maakt die ik kan gebruiken om spraak te creëren die klinkt als ik. Ik train mijn stem door de volgende verklaring te lezen:\n\nOp aarde heeft iedereen zijn eigen stem. Het is alsof je een speciaal geluid hebt dat niemand anders heeft. We gebruiken onze stemmen om verhalen te vertellen, ideeën te delen en mooie dingen te maken.\n\nIn een klein dorpje was er een groep vrienden die ervan hielden om verhalen te vertellen. Ze zouden onder een grote boom zitten en ieder zou een verhaal vertellen met zijn eigen stem. Een vriend had een stem die diep en krachtig was, als een trommel. Een ander had een stem die licht en vrolijk was, als een vogel die in de ochtend zingt.\n\nOp een dag besloten ze hun stemmen te gebruiken om iets speciaals te maken. Ze wilden laten zien hoe verschillende stemmen samen iets moois kunnen creëren. Ze begonnen een grote show voor hun dorp te plannen.\n\nElke vriend schreef een deel van het verhaal. Ze oefenden om duidelijk en luid te spreken zodat iedereen kon horen. Ze gebruikten hun stemmen om de personages in het verhaal tot leven te brengen. Sommige delen van het verhaal waren grappig en lieten mensen lachen. Andere delen waren serieus en zetten mensen aan het denken.\n\nOp de dag van de show kwamen mensen van overal in het dorp luisteren. De vrienden stonden onder de grote boom en begonnen hun verhaal te vertellen. Elke stem was anders, maar samen klonken ze geweldig. Mensen klapten en glimlachten terwijl ze luisterden.\n\nEn vanaf die dag ontmoetten de vrienden elkaar elke week onder de boom om nieuwe verhalen te vertellen. Ze leerden dat elke stem belangrijk is en dat ze samen de wereld interessanter en mooier kunnen maken." },
  { name: 'Turkish', script: "Benim sesimi yapay bir versiyon olarak oluşturmasını istiyorum SpeakUp AI'dan ve bu sesle benim gibi kulağa gelen konuşmalar yaratmak için kullanacağım. Sesimi eğitiyorum ve şunu okuyarak antrenman yapıyorum:\n\nDünyada herkesin kendi sesi var. Bu, başka kimsenin sahip olmadığı özel bir ses gibi bir şey. Hikayeler anlatmak, fikirler paylaşmak ve güzel şeyler yapmak için seslerimizi kullanırız.\n\nKüçük bir kasabada hikaye anlatmayı seven bir arkadaş grubu vardı. Büyük bir ağacın altında otururlar ve her biri kendi sesiyle bir hikaye anlatırdı. Arkadaşlardan birinin sesi, bir davul gibi derin ve güçlüydü. Bir diğerinin sesi ise sabahleyin şarkı söyleyen bir kuş gibi hafif ve neşeliydi.\n\nBir gün, seslerini özel bir şey yapmak için kullanmaya karar verdiler. Farklı seslerin bir araya gelerek nasıl güzel bir şey yaratabileceğini göstermek istediler. Kasaba için büyük bir gösteri planlamaya başladılar.\n\nHer arkadaş hikayenin bir bölümünü yazdı. Herkesin duyabileceği şekilde açık ve yüksek sesle konuşmayı pratik yaptılar. Karakterleri hikayede canlandırmak için seslerini kullandılar. Hikayenin bazı bölümleri komikti ve insanları güldürdü. Diğer bazı bölümleri ciddiydi ve insanları düşündürdü.\n\nGösteri gününde kasabadan insanlar dinlemek için geldi. Arkadaşlar büyük ağacın altında durup hikayelerini anlatmaya başladı. Her ses farklıydı, ama birlikte harika bir uyum içindeydiler. İnsanlar dinlerken alkışladılar ve güldüler.\n\nVe o günden sonra, arkadaşlar her hafta yeni hikayeler anlatmak için ağacın altında buluşmaya devam ettiler. Her sesin önemli olduğunu ve birlikte dünyayı daha ilginç ve güzel bir yer yapabileceklerini öğrendiler." },
  { name: 'Filipino', script: "Nais kong magpagawa sa SpeakUp AI ng isang artipisyal na bersyon ng aking boses na magagamit ko upang lumikha ng pagsasalita na tunog na parang ako. Sinasanay ko ang aking boses sa pamamagitan ng pagbabasa ng sumusunod na pahayag:\n\nSa Mundo, bawat isa ay may kanya-kanyang boses. Para itong pagkakaroon ng espesyal na tunog na wala sa iba. Ginagamit natin ang ating mga boses upang magkuwento, magbahagi ng mga ideya, at lumikha ng mga magagandang bagay.\n\nSa isang maliit na bayan, may isang grupo ng magkakaibigan na mahilig magkuwento. Sila'y nagtitipon sa ilalim ng isang malaking puno at bawat isa'y magkukuwento gamit ang kanyang boses. Ang isa sa mga kaibigan ay may boses na malalim at malakas, tulad ng isang tambol. Ang isa naman ay may boses na magaan at masayahin, tulad ng ibon na kumakanta sa umaga.\n\nIsang araw, nagpasya sila na gamitin ang kanilang mga boses upang lumikha ng isang espesyal na bagay. Gusto nilang ipakita kung paano maaaring magkasama-sama ang iba't ibang boses upang lumikha ng isang magandang bagay. Nagsimula silang magplano ng isang malaking palabas para sa kanilang bayan.\n\nBawat kaibigan ay sumulat ng bahagi ng kuwento. Nagsanay sila ng malinaw at malakas na pagsasalita para marinig ng lahat. Ginamit nila ang kanilang mga boses upang bigyang-buhay ang mga karakter sa kuwento. Ang ibang bahagi ng kuwento ay nakakatawa at nakapagpapatawa sa mga tao. Ang iba naman ay seryoso at nakapagpapaisip.\n\nSa araw ng palabas, ang mga tao mula sa iba't ibang sulok ng bayan ay dumating upang makinig. Tumayo ang mga kaibigan sa ilalim ng malaking puno at sinimulang ikwento ang kanilang istorya. Magkakaiba man ang boses ng bawat isa, magkasama ay tunog silang kahanga-hanga. Pinalakpakan at ngumiti ang mga tao habang nakikinig.\n\nAt mula noong araw na iyon, ang mga kaibigan ay nagkikita sa ilalim ng puno kada linggo upang magbahagi ng bagong mga kuwento. Natutuhan nila na mahalaga ang bawat boses at na, magkasama, maaari nilang gawing mas kawili-wili at maganda ang mundo." },
  { name: 'Polish', script: "Chcę, aby SpeakUp AI stworzyło sztuczną wersję mojego głosu, której będę mógł używać do tworzenia mowy brzmiącej tak jak ja. Trenuję swój głos, czytając następujące stwierdzenie:\n\nNa Ziemi każdy ma swój własny głos. To tak, jakby mieć specjalny dźwięk, którego nikt inny nie ma. Używamy naszych głosów, aby opowiadać historie, dzielić się pomysłami i tworzyć piękne rzeczy.\n\nW małym miasteczku była grupa przyjaciół, którzy uwielbiali opowiadać historie. Siadali pod dużym drzewem i każdy opowiadał swoją historię, używając swojego głosu. Jeden przyjaciel miał głos głęboki i mocny, jak bęben. Innym jego głos był lekki i wesoły, jak śpiew ptaka o poranku.\n\nPewnego dnia postanowili wykorzystać swoje głosy, aby stworzyć coś wyjątkowego. Chcieli pokazać, jak różne głosy mogą się połączyć, aby stworzyć coś pięknego. Zaczątkasować planowanie wielkiego przedstawienia dla swojego miasta.\n\nKażdy przyjaciel napisał część historii. Ćwiczyli mówienie wyraźnie i głośno, żeby wszyscy mogli słyszeć. Używali swoich głosów, aby ożywić postacie w historii. Niektóre części historii były zabawne i śmieszyły ludzi. Inne części były poważne i skłaniały ludzi do myślenia.\n\nW dniu przedstawienia ludzie z całego miasta przyszli posłuchać. Przyjaciele stanęli pod dużym drzewem i zaczęli opowiadać swoją historię. Każdy głos był inny, ale razem brzmiały niesamowicie. Ludzie klaskali i uśmiechali się, słuchając.\n\nI od tego dnia przyjaciele spotykali się pod drzewem co tydzień, aby opowiadać nowe historie. Zrozumieli, że każdy głos jest ważny i że razem mogą uczynić świat bardziej interesującym i pięknym miejscem." },
  { name: 'Swedish', script: "Jag vill att SpeakUp AI skapar en artificiell version av min röst som jag kan använda för att skapa tal som låter som mig. Jag tränar min röst genom att läsa följande uttalande:\n\nPå jorden har alla sin egen röst. Det är som att ha ett speciellt ljud som ingen annan har. Vi använder våra röster för att berätta historier, dela idéer och skapa vackra saker.\n\nI en liten stad fanns det en grupp vänner som älskade att berätta historier. De skulle sitta under ett stort träd och var och en skulle berätta en historia med sin röst. En vän hade en röst som var djup och stark, som en trumma. En annan hade en röst som var lätt och glad, som en fågel som sjunger på morgonen.\n\nEn dag bestämde de sig för att använda sina röster för att skapa något speciellt. De ville visa hur olika röster kan komma samman för att skapa något vackert. De började planera en stor föreställning för sin stad.\n\nVarje vän skrev en del av historien. De övade på att tala tydligt och högt så att alla kunde höra. De använde sina röster för att ge liv åt karaktärerna i historien. Vissa delar av historien var roliga och fick folk att skratta. Andra delar var allvarliga och fick folk att tänka.\n\nPå föreställningens dag kom människor från hela staden för att lyssna. Vännerna stod under det stora trädet och började berätta sin historia. Varje röst var annorlunda, men tillsammans lät de fantastiskt. Människor klappade och log när de lyssnade.\n\nOch från den dagen träffades vännerna under trädet varje vecka för att berätta nya historier. De lärde sig att varje röst är viktig och att tillsammans kan de göra världen till en mer intressant och vacker plats." },
  { name: 'Bulgarian', script: "Искам SpeakUp AI да създаде изкуствена версия на моя глас, която мога да използвам за създаване на реч, която звучи като мен. Обучавам гласа си, като чета следното изявление:\n\nНа Земята всеки има свой собствен глас. Това е като да имаш специален звук, който никой друг няма. Използваме гласовете си, за да разказваме истории, да споделяме идеи и да създаваме красиви неща.\n\nВ едно малко градче имаше група приятели, които обичаха да разказват истории. Те седяха под голямо дърво и всеки разказваше история със своя глас. Един приятел имаше глас, който беше дълбок и силен, като барабан. Друг имаше глас, който беше светъл и весел, като птица, която пее сутрин.\n\nЕдин ден те решиха да използват гласовете си, за да създадат нещо специално. Искаха да покажат как различните гласове могат да се обединят и да създадат нещо красиво. Започнаха да планират голямо представление за своя град.\n\nВсеки приятел написа част от историята. Тренираха да говорят ясно и силно, така че всички да могат да чуят. Използваха гласовете си, за да донесат персонажите в историята на живот. Някои части от историята бяха смешни и караха хората да се смеят. Други части бяха сериозни и караха хората да мислят.\n\nНа деня на представлението хора от целия град дойдоха да слушат. Приятелите застанаха под голямото дърво и започнаха да разказват своята история. Всеки глас беше различен, но заедно те звучаха невероятно. Хората аплодираха и се усмихваха докато слушаха.\n\nИ от този ден нататък, приятелите се срещаха под дървото всяка седмица, за да разказват нови истории. Разбраха, че всеки глас е важен и че заедно могат да направят света по-интересно и красиво място." },
  { name: 'Romanian', script: "Doresc ca SpeakUp AI să creeze o versiune artificială a vocii mele pe care să o pot utiliza pentru a crea vorbire care să sune ca mine. Îmi antrenez vocea citind următoarea declarație:\n\nPe Pământ, fiecare are propria sa voce. E ca și cum ai avea un sunet special pe care nimeni altcineva nu-l are. Ne folosim vocile pentru a spune povești, a împărtăși idei și a crea lucruri frumoase.\n\nÎntr-un orășel mic, era un grup de prieteni care iubeau să spună povești. Se așezau sub un copac mare și fiecare își spunea povestea folosindu-și vocea. Un prieten avea o voce profundă și puternică, ca un tobe. Altul avea o voce ușoară și veselă, ca o pasăre cântând dimineața.\n\nÎntr-o zi, au decis să își folosească vocile pentru a crea ceva special. Voiau să arate cum voci diferite pot veni împreună pentru a crea ceva frumos. Au început să planifice un mare spectacol pentru orașul lor.\n\nFiecare prieten a scris o parte din poveste. Exersau să vorbească clar și tare ca toată lumea să poată auzi. Își foloseau vocile pentru a da viață personajelor din poveste. Unele părți ale poveștii erau amuzante și făceau oamenii să râdă. Alte părți erau serioase și făceau oamenii să reflecteze.\n\nÎn ziua spectacolului, oameni din întregul oraș au venit să asculte. Prietenii au stat sub copacul mare și au început să-și spună povestea. Fiecare voce era diferită, dar împreună sunau uimitor. Oamenii aplaudau și zâmbeau pe măsură ce ascultau.\n\nȘi de atunci, prietenii se întâlneau sub copac în fiecare săptămână pentru a spune povești noi. Au învățat că fiecare voce este importantă și că împreună, pot face lumea un loc mai interesant și mai frumos." },
  { name: 'Arabic', script: "أريد أن يقوم برنامج SpeakUp AI بإنشاء نسخة صناعية من صوتي يمكنني استخدامها لإنشاء كلام يبدو مشابهًا لي. أنا أقوم بتدريب صوتي عن طريق قراءة البيان التالي:\n\nعلى الأرض، لكل شخص صوته الخاص به. إنه كأنه صوت مميز لا يمكن لأحد آخر الحصول عليه. نحن نستخدم أصواتنا لسرد القصص ومشاركة الأفكار وصنع أشياء جميلة.\n\nفي بلدة صغيرة، كان هناك مجموعة من الأصدقاء يحبون سرد القصص. كانوا يجلسون تحت شجرة كبيرة وكل منهم يروي قصة باستخدام صوته. كان لدي صديق صوت عميق وقوي، مثل الطبل. وكان لدي آخر صوت خفيف ومبهج، مثل طائر يغرد في الصباح.\n\nذات يوم، قرروا استخدام أصواتهم لصنع شيء خاص. كانوا يريدون إظهار كيف يمكن للأصوات المختلفة أن تتألف معًا لخلق شيء جميل. بدأوا في التخطيط لعرض كبير لبلدتهم.\n\nكتب كل صديق جزءًا من القصة. تدربوا على التحدث بوضوح وبصوت عالٍ حتى يمكن للجميع الاستماع. استخدموا أصواتهم لإحياء الشخصيات في القصة. بعض أجزاء القصة كانت مضحكة وجعلت الناس يضحكون. بينما كانت أجزاء أخرى جدية وجعلت الناس يفكرون.\n\nفي يوم العرض، جاء الناس من جميع أنحاء البلدة للاستماع. وقف الأصدقاء تحت الشجرة الكبيرة وبدأوا بسرد قصتهم. كان كل صوت مختلفًا، ولكن معًا كانوا يبدون رائعين. صفق الناس وابتسموا وهم يستمعون.\n\nومنذ ذلك اليوم، التقى الأصدقاء تحت الشجرة كل أسبوع لسرد قصص جديدة. تعلموا أن كل صوت مهم وأنهم معًا يمكنهم جعل العالم مكانًا أكثر إثارة للاهتمام وجمالًا." },
  { name: 'Czech', script: "Chci, aby SpeakUp AI vytvořil umělou verzi mého hlasu, kterou budu moci používat k vytváření řeči, která zní jako já. Trénuji svůj hlas čtením následujícího prohlášení:\n\nNa Zemi má každý svůj vlastní hlas. Je to jako mít zvláštní zvuk, který nemá nikdo jiný. Naše hlasy používáme k vyprávění příběhů, sdílení nápadů a vytváření krásných věcí.\n\nV malém městečku byla skupina přátel, která ráda vyprávěla příběhy. Sedávali pod velkým stromem a každý z nich vyprávěl příběh svým hlasem. Jeden přítel měl hlas hluboký a silný jako bubny. Další měl hlas lehký a veselý jako ptačí zpěv ráno.\n\nJednoho dne se rozhodli použít své hlasy k vytvoření něčeho zvláštního. Chtěli ukázat, jak různé hlasy můžou společně vytvořit něco krásného. Začali plánovat velké představení pro své městečko.\n\nKaždý přítel napsal část příběhu. Cvičili v jasném a hlasitém mluvení, aby je všichni mohli slyšet. Používali své hlasy k oživení postav v příběhu. Některé části příběhu byly vtipné a lidi se smáli. Jiné části byly vážné a přiměly lidi k zamyšlení.\n\nV den představení přišli lidé z celého města poslouchat. Přátelé stáli pod velkým stromem a začali vyprávět svůj příběh. Každý hlas byl odlišný, ale společně zněli úžasně. Lidé tleskali a smáli se, když poslouchali.\n\nA od toho dne se přátelé každý týden setkávali pod stromem, aby vyprávěli nové příběhy. Zjistili, že každý hlas je důležitý a že společně mohou učinit svět zajímavějším a krásnějším místem." },
  { name: 'Greek', script: "Θέλω το SpeakUp AI να δημιουργήσει μια τεχνητή έκδοση της φωνής μου, την οποία μπορώ να χρησιμοποιήσω για να δημιουργήσω ομιλίες που ακούγονται σαν εμένα. Εκπαιδεύω τη φωνή μου διαβάζοντας την εξής δήλωση:\nΣτη Γη, κάθε άνθρωπος έχει τη δική του φωνή. Είναι σαν να έχεις έναν ιδιαίτερο ήχο που κανείς άλλος δεν έχει. Χρησιμοποιούμε τις φωνές μας για να διηγούμαστε ιστορίες, να μοιραζόμαστε ιδέες και να δημιουργούμε όμορφα πράγματα.\n\nΣε μια μικρή πόλη, υπήρχε μια ομάδα φίλων που τους άρεσε να διηγούνται ιστορίες. Θα καθόντουσαν κάτω από ένα μεγάλο δέντρο και ο καθένας θα διηγούνταν μια ιστορία χρησιμοποιώντας τη φωνή του. Ένας φίλος είχε μια φωνή βαθιά και δυνατή, σαν ένα τύμπανο. Ένας άλλος είχε μια φωνή ανάλαφρη και ευχάριστη, σαν ένα πουλί που τραγουδά το πρωί.\n\nΜια μέρα, αποφάσισαν να χρησιμοποιήσουν τις φωνές τους για να κάνουν κάτι ξεχωριστό. Ήθελαν να δείξουν πώς διαφορετικές φωνές μπορούν να συνδυαστούν για να δημιουργήσουν κάτι όμορφο. Αρχίσανε να σχεδιάζουν μια μεγάλη εκδήλωση για την πόλη τους.\n\nΚάθε φίλος έγραφε ένα μέρος της ιστορίας. Εξασκούσαν τον εαυτό τους να μιλάει καθαρά και δυνατά ώστε όλοι να μπορούν να ακούσουν. Χρησιμοποιούσαν τις φωνές τους για να ζωντανεύσουν τους χαρακτήρες της ιστορίας. Κάποια μέρη της ιστορίας ήταν αστεία και έκαναν τους ανθρώπους να γελάνε. Άλλα μέρη ήταν σοβαρά και έκαναν τους ανθρώπους να σκεφτούν.\n\nΤην ημέρα της εκδήλωσης, άνθρωποι απ' όλη την πόλη ήρθαν να ακούσουν. Οι φίλοι στέκονταν κάτω από το μεγάλο δέντρο και άρχισαν να διηγούνται την ιστορία τους. Κάθε φωνή ήταν διαφορετική, αλλά μαζί ακουγόταν εκπληκτικές. Οι άνθρωποι χειροκροτούσαν και χαμογελούσαν καθώς άκουγαν.\n\nΚαι από εκείνη τη μέρα, οι φίλοι συναντιόντουσαν κάτω από το δέντρο κάθε εβδομάδα για να λένε νέες ιστορίες. Διαπίστωσαν ότι κάθε φωνή είναι σημαντική και ότι μαζί, μπορούν να κάνουν τον κόσμο ένα πιο ενδιαφέρον και όμορφο μέρος." },
  { name: 'Finnish', script: "Haluan, että SpeakUp AI luo keinotekoisen version äänestäni, jonka voin käyttää luomaan puheita, jotka kuulostavat minulta. Koulutan ääntäni lukemalla seuraavan lausunnon:\n\nMaapallolla jokaisella on oma äänensä. Se on kuin erityinen ääni, jota kukaan muu ei omista. Käytämme ääniämme tarinoiden kertomiseen, ideoiden jakamiseen ja kauniiden asioiden luomiseen.\n\nPienessä kaupungissa oli ryhmä ystäviä, jotka rakastivat tarinoiden kertomista. He istuivat suuren puun alla ja jokainen kertoi vuorollaan tarinan käyttäen omaa ääntään. Yhdellä ystävistä oli ääni, joka oli syvä ja voimakas, kuin rumpu. Toisella oli ääni, joka oli kevyt ja iloinen, kuin lintu laulamassa aamuisin.\n\nEräänä päivänä he päättivät käyttää ääniään luodakseen jotakin erityistä. He halusivat näyttää, miten erilaiset äänet voivat tulla yhteen luodakseen jotakin kaunista. He alkoivat suunnitella suurta esitystä kaupungilleen.\n\nJokainen ystävä kirjoitti osan tarinasta. He harjoittelivat puhumaan selkeästi ja kovaa, jotta kaikki voisivat kuulla. He käyttivät ääniään herättääkseen hahmot tarinassa eloon. Jotkut tarinan osat olivat hauskoja ja saivat ihmiset nauramaan. Toiset osat olivat vakavia ja saivat ihmiset ajattelemaan.\n\nEsityspäivänä ihmiset saapuivat ympäri kaupunkia kuuntelemaan. Ystävät seisoivat suuren puun alla ja alkoivat kertoa tarinaansa. Jokainen ääni oli erilainen, mutta yhdessä ne kuulostivat hämmästyttäviltä. Ihmiset taputtivat ja hymyilivät kuunnellessaan.\n\nJa siitä päivästä lähtien ystävät tapasivat puun alla joka viikko kertoakseen uusia tarinoita. He oppivat, että jokainen ääni on tärkeä ja että yhdessä he voivat tehdä maailmasta mielenkiintoisemman ja kauniimman paikan." },
  { name: 'Croatian', script: "Želim da SpeakUp AI stvori umjetnu verziju mog glasa koju mogu koristiti za stvaranje govora koji zvuči kao ja. Svoj glas treniram čitajući sljedeću izjavu:\n\nNa Zemlji, svatko ima svoj vlastiti glas. To je kao da imamo poseban zvuk koji nitko drugi nema. Koristimo naše glasove kako bismo pričali priče, dijelili ideje i stvarali prekrasne stvari.\n\nU malom gradu postojala je grupa prijatelja koja je voljela pričati priče. Sjedili bi ispod velikog drveta i svatko bi naizmjenično pričao priču koristeći svoj glas. Jedan prijatelj imao je glas dubok i snažan, poput bubnja. Drugi je imao glas lagan i vesel, poput ptičjeg pjeva ujutro.\n\nJednog dana su odlučili koristiti svoje glasove kako bi stvorili nešto posebno. Željeli su pokazati kako različiti glasovi mogu zajedno stvoriti nešto prekrasno. Počeli su planirati veliku predstavu za svoj grad.\n\nSvaki prijatelj napisao je dio priče. Vježbali su jasno i glasno govoriti kako bi ih svi mogli čuti. Koristili su svoje glasove kako bi likovi u priči oživjeli. Neki dijelovi priče bili su smiješni i ljude su nasmijali. Drugi dijelovi bili su ozbiljni i nagnali su ljude na razmišljanje.\n\nNa dan predstave, ljudi iz cijelog grada došli su slušati. Prijatelji su stajali ispod velikog drveta i počeli pričati svoju priču. Svaki glas je bio različit, ali zajedno su zvučali nevjerojatno. Ljudi su pljeskali i smiješili se dok su slušali.\n\nI od tog dana, prijatelji su se svaki tjedan sastajali ispod drveta kako bi pričali nove priče. Naučili su da je svaki glas važan i da zajedno mogu učiniti svijet zanimljivijim i ljepšim mjestom." },
  { name: 'Malay', script: "Saya mahu SpeakUp AI mencipta versi buatan suara saya yang dapat saya gunakan untuk mencipta ucapan yang kedengaran seperti saya. Saya sedang melatih suara saya dengan membaca kenyataan berikut:\n\nDi Bumi, setiap orang mempunyai suara mereka sendiri. Ia seperti mempunyai bunyi istimewa yang tiada orang lain miliki. Kita menggunakan suara kita untuk menceritakan kisah, berkongsi idea, dan mencipta benda yang indah.\n\nDi sebuah pekan kecil, terdapat sekumpulan sahabat yang gemar menceritakan kisah. Mereka akan duduk di bawah pokok yang besar dan setiap orang akan menceritakan sebuah kisah menggunakan suara mereka. Seorang sahabat mempunyai suara yang dalam dan kuat, seperti gendang. Satu lagi mempunyai suara yang ringan dan ceria, seperti burung yang berkicau di pagi hari.\n\nSuatu hari, mereka memutuskan untuk menggunakan suara mereka mencipta sesuatu yang istimewa. Mereka ingin menunjukkan bagaimana gabungan suara yang berbeza dapat mencipta sesuatu yang indah. Mereka mulai merancang pertunjukan besar untuk pekan mereka.\n\nSetiap sahabat menulis sebahagian dari cerita tersebut. Mereka berlatih bercakap dengan jelas dan kuat supaya semua orang dapat mendengar. Mereka menggunakan suara mereka untuk menghidupkan watak dalam cerita tersebut. Beberapa bahagian cerita itu lucu dan membuat orang tertawa. Bagian lain serius dan membuat orang berfikir.\n\nPada hari pertunjukan, orang dari seluruh pekan datang untuk mendengar. Sahabat-sahabat berdiri di bawah pokok besar dan mulai menceritakan cerita mereka. Setiap suara adalah berlainan, tetapi bersama-sama mereka kedengaran hebat. Orang-orang bertepuk tangan dan tersenyum ketika mendengarkan.\n\nDan mulai hari itu, sahabat-sahabat bertemu di bawah pokok setiap minggu untuk menceritakan kisah baru. Mereka belajar bahawa setiap suara itu penting dan bersama-sama, mereka dapat membuat dunia ini menjadi tempat yang lebih menarik dan indah." },
  { name: 'Slovak', script: "Chcem, aby SpeakUp AI vytvoril umelú verziu môjho hlasu, ktorú môžem použiť na vytváranie reči, ktorá znie ako ja. Svoj hlas trénujem čítaním nasledujúceho vyhlásenia:\n\nNa Zemi má každý svoj vlastný hlas. Je to ako mať špeciálny zvuk, ktorý nikto iný nemá. Naše hlasy používame na rozprávanie príbehov, zdieľanie nápadov a tvorbu krásnych vecí.\n\nV malom mestečku bola skupina priateľov, ktorí mali radi rozprávanie príbehov. Sedeli by pod veľkým stromom a každý by rozprával príbeh svojim hlasom. Jeden priateľ mal hlas hlboký a silný ako bubon. Ďalší mal hlas ľahký a veselý ako spev vtáčika ráno.\n\nJedného dňa sa rozhodli použiť svoje hlasy na vytvorenie niečoho špeciálneho. Chceli ukázať, ako rozdielne hlasy môžu spoločne vytvoriť niečo krásne. Začali plánovať veľké predstavenie pre ich mesto.\n\nKaždý priateľ napísal časť príbehu. Cvičili v jasnej a hlasnej reči, aby ich všetci počuli. Svoje hlasy použili na to, aby postavy v príbehu ožili. Niektoré časti príbehu boli vtipné a ľudia sa smiali. Iné časti boli vážne a prinútili ľudí zamyslieť sa.\n\nV deň predstavenia prišli ľudia z celého mesta počúvať. Priatelia stáli pod veľkým stromom a začali rozprávať svoj príbeh. Každý hlas bol iný, ale spolu zneli úžasne. Ľudia tlieskali a usmievali sa, keď počúvali.\n\nA od toho dňa sa priatelia stretávali pod stromom každý týždeň, aby rozprávali nové príbehy. Zistili, že každý hlas je dôležitý a že spoločne môžu svet urobiť zaujímavejším a krajším miestom." },
  { name: 'Danish', script: "Jeg ønsker at SpeakUp AI skal skabe en kunstig version af min stemme, som jeg kan bruge til at skabe tale, der lyder som mig. Jeg træner min stemme ved at læse følgende udsagn:\n\nPå Jorden har alle deres egen stemme. Det er som at have en særlig lyd, som ingen andre har. Vi bruger vores stemmer til at fortælle historier, dele idéer og skabe smukke ting.\n\nI en lille by var der en gruppe venner, der elskede at fortælle historier. De ville sidde under et stort træ, og hver især ville fortælle en historie ved hjælp af deres stemme. En ven havde en stemme, der var dyb og kraftfuld, som en tromme. En anden havde en stemme, der var let og munter, som en fugl, der synger om morgenen.\n\nEn dag besluttede de at bruge deres stemmer til at skabe noget særligt. De ønskede at vise, hvordan forskellige stemmer kan samles for at skabe noget smukt. De begyndte at planlægge et stort show for deres by.\n\nHver ven skrev en del af historien. De øvede sig i at tale klart og højt, så alle kunne høre dem. De brugte deres stemmer til at bringe figurerne i historien til live. Nogle dele af historien var sjove og fik folk til at grine. Andre dele var seriøse og fik folk til at tænke.\n\nPå dagen for showet kom mennesker fra hele byen for at lytte. Vennerne stod under det store træ og begyndte at fortælle deres historie. Hver stemme var forskellig, men sammen lød de fantastiske. Folk klappede og smilede, mens de lyttede.\n\nOg fra den dag af mødtes vennerne under træet hver uge for at fortælle nye historier. De lærte, at hver stemme er vigtig, og at de sammen kan gøre verden til et mere interessant og smukt sted." },
  { name: 'Tamil', script: "நான் SpeakUp AI-ஐ எனக்கு ஒரு செயற்கை குரலை உருவாக்கும்படி விரும்புகிறேன், என்னைப் போன்ற பேச்சை உருவாக்க நான் அதை பயன்படுத்த முடியும். கீழ்க்காணும் அறிக்கையை வாசித்து எனது குரலை பயிற்சி செய்கிறேன்:\n\nபூமியில், ஒவ்வொருவருக்கும் தனித்தனி குரல் இருக்கிறது. அது வேறு எந்தருக்கும் இல்லாத ஒரு சிறப்பு சத்தம் போன்றது. நாம் நம்முடைய குரல்களை பயன்படுத்தி கதைகள் சொல்ல, யோசனைகளை பகிர்ந்துகொள்ள, மற்றும் அழகான பொருட்களை உருவாக்குகிறோம்.\n\nஒரு சிறிய நகரத்தில், கதைகள் சொல்ல விரும்பிய ஒரு குழுமம் இருந்தது. அவர்கள் ஒரு பெரிய மரத்தின் கீழ் அமர்ந்து ஒவ்வொருவரும் தன்னுடைய குரலை பயன்படுத்தி ஒரு கதை சொல்லுவார்கள். ஒரு நண்பரின் குரல் மிகவும் ஆழமானதும் பலமானதும், ஒரு மத்திய இசைவான் போன்றது. மற்றொரு நண்பரின் குரல் லேசானதும் மகிழ்ச்சியானதும், காலையில் பாடும் பறவை போன்றிருந்தது.\n\nஒரு நாள், அவர்கள் தங்களுடைய குரல்களை பயன்படுத்தி ஒரு சிறப்பு பொருட்களை உருவாக்க முடிவு செய்தனர். வெவ்வேறு குரல்கள் ஒன்றுகூடி ஏதோ ஒன்றை அழகாக உருவாக்க முடியும் என்பதை காட்ட அவர்கள் விரும்பினர். அவர்கள் நகருக்கு ஒரு பெரிய நிகழ்ச்சி அமைக்க திட்டமிட தொடங்கினர்.\n\nஒவ்வொரு நண்பரும் கதையின் ஒரு பகுதியை எழுதினர். அனைவரும் தெளிவாகவும் உச்சரிப்பதில் பெரிதும் அயராது பயிற்சி செய்தனர், எனவே எல்லோரும் கேட்கும்படி உச்சரித்தனர். கதையில் உள்ள பாத்திரங்களை உயிர்த்து பேச அவர்கள் தங்களுடைய குரல்களை பயன்படுத்தினார்கள். கதையின் சில பகுதிகள் நகைச்சுவையானவையும் மக்கள் சிரிக்கவும் செய்தன. மற்ற பகுதிகள் கம்பீரமானவையும் மக்கள் சிந்திக்கவும் செய்தன.\n\nநிகழ்ச்சியின் நாளில், நகரம் முழுவதிலிருந்தும் மக்கள் கேட்க வந்தனர். நண்பர்கள் பெரிய மரத்தின் கீழ் நின்று தங்களுடைய கதையை சொல்ல தொடங்கினர். ஒவ்வொரு குரலும் வெவ்வேறு போன்றிருந்தாலும், ஒன்றாகச் சேர்ந்து அதிசயமாக ஒலித்தன. மக்கள் கைதட்டி, புன்னகையுடன் கேட்டனர்.\n\nஅந்த நாளிலிருந்து, நண்பர்கள் ஒவ்வொரு வாரமும் புதிய கதைகள் சொல்ல மரத்தின் கீழ் சந்தித்துக் கொண்டனர். அவர்கள் ஒவ்வொரு குரலும் முக்கியமானது மற்றும் ஒன்றாக இணைந்து, உலகை ஒரு ஆர்வமும் அழகும் மிகுந்த இடமாக மாற்ற முடியும் என்பதை கற்றுக்கொண்டனர்." },
  { name: 'Ukrainian', script: "Я хочу, щоб SpeakUp AI створив штучну версію мого голосу, яку я міг би використовувати для створення мови, яка звучить як моя. Я треную свій голос, читаючи наступне твердження:\n\nНа Землі кожен має свій власний голос. Це ніби мати особливий звук, якого немає у когось іншого. Ми використовуємо наші голоси, щоб розповідати історії, ділитись ідеями та створювати прекрасні речі.\n\nУ невеликому містечку була група друзів, які любили розповідати історії. Вони сідали під велике дерево, і кожен розповідав свою історію своїм голосом. Один друг мав голос глибокий і міцний, як барабан. Інший мав голос легкий і веселий, ніби спів птаха вранці.\n\nОдного дня вони вирішили використати свої голоси для створення чогось особливого. Вони хотіли показати, як різні голоси можуть об'єднатися, щоб створити щось прекрасне. Вони почали планувати велике шоу для свого міста.\n\nКожен друг написав частину історії. Вони практикувалися говорити чітко та голосно, щоб усі могли почути. Вони використовували свої голоси, щоб оживити персонажів у історії. Деякі частини історії були смішними і змушували людей сміятися. Інші частини були серйозними і змушували людей замислюватися.\n\nВ день шоу люди з усього міста прийшли послухати. Друзі стояли під великим деревом і почали розповідати свою історію. Кожен голос був інший, але разом вони звучали дивовижно. Люди аплодували та усміхалися, слухаючи.\n\nІ з того дня друзі зустрічалися під деревом щотижня, щоб розповідати нові історії. Вони зрозуміли, що кожен голос є важливим і що разом вони можуть зробити світ цікавішим та прекраснішим." },
  { name: 'Russian', script: "Я хочу, чтобы SpeakUp AI создал искусственную версию моего голоса, которую я мог бы использовать для создания речи, звучащей как моя. Для тренировки голоса я читаю следующее утверждение: \n\nНа Земле у каждого есть свой голос. Это словно иметь особенный звук, который ни у кого другого нет. Мы используем свой голос, чтобы рассказывать истории, делиться идеями и творить красивые вещи.\n\nВ одном маленьком городке была группа друзей, которым нравилось рассказывать истории. Они собирались под большим деревом, и каждый рассказывал свою историю, используя свой голос. У одного друга голос был глубоким и сильным, как барабан. У другого голос был лёгким и весёлым, как пение птицы по утрам.\n\nОднажды они решили использовать свои голоса, чтобы создать что-то особенное. Они хотели показать, как разные голоса могут соединяться, чтобы создать что-то прекрасное. Они начали планировать большое представление для своего города.\n\nКаждый друг написал часть истории. Они упражнялись говорить чётко и громко, чтобы все могли слышать. Они использовали свои голоса, чтобы оживить персонажей в истории. Некоторые части истории были смешными и заставляли людей смеяться. Другие были серьёзными и заставляли людей задумываться.\n\nВ день представления люди со всего города пришли послушать. Друзья встали под большим деревом и начали рассказывать свою историю. Каждый голос был неповторим, но вместе они звучали потрясающе. Люди аплодировали и улыбались, слушая.\n\nИ с того дня друзья собирались под деревом каждую неделю, чтобы рассказывать новые истории. Они поняли, что каждый голос важен и что вместе они могут сделать мир более интересным и красивым." },
]

export const PODCAST_STYLES = [
  { name: "Brief (5 - 10 min)", minLength: 5, maxLength: 10 },
  { name: "Medium (10 - 20 min)", minLength: 10, maxLength: 20 },
  { name: "Long (20 - 30 min)", minLength: 20, maxLength: 30 },
  // { name: 'Longer', length: 60 },
];

export const BACKGROUND_MUSIC_VOLUME = [
  { name: "No music", volume: 0 },
  { name: "Quiet", volume: 1.1 },
  { name: "Normal", volume: 1.3 },
  { name: "Loud", volume: 1.5 }
]

const TEXT_DOS1 = ["Offline content", "PDF/Books", "Paywall content"];

const TEXT_DOS2 = ["Forum threads", "Social feeds", "Online docs"];

const TEXT_DONTS = ["Content too short", "Avoid ads", "Website code"];

const URL_DOS1 = ["Newsletters", "Blogs", "News articles"];

const URL_DOS2 = ["Substack", "Medium", "YouTube"];

const URL_DONTS = ["Paywall content", "Sign in required", "Content too short"];

const DetailedUrlInput = (props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [notification, setShowNotification] = useState(false);

  const showNotificationTemporarily = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  useEffect(() => {
    if (props.showNotification) {
      showNotificationTemporarily();
    }
  }, []);

  const userId = useAppSelector(getUserId);
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [podcastTitle, setPodcastTitle] = useState();
  const [hostName, setHostName] = useState();
  const [voiceId, setVoiceId] = useState();
  const [selectedVoice, setSelectedVoice] = useState();
  const [totalMinLength, setTotalMinLength] = useState(5);
  const [totalMaxLength, setTotalMaxLength] = useState(10);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(1.3)
  const [adContent, setAdContent] = useState(AD_CONTENT);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [activeTab, setActiveTab] = useState("url"); // possible values: 'url', 'text'
  const [userAckWordCount, setUserAckWordCount] = useState(false);

  const [scriptOnly, setScriptOnly] = useState(true);

  const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);
  const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES);
  const [showCreateFromTextHelper, setShowCreateFromTextHelper] =
    useState(true);
  const [showCreateFromUrlHelper, setShowCreateFromUrlHelper] = useState(true);

  const urlPlaceholders = [
    "Drop URLs to turn articles into podcasts instantly...",
    "Drop multiple links for a longer, richer, cohesive episode...",
    "Repurpose your newsletters into podcasts. Drop Substack links here...",
    "Got a YouTube video? Convert it to an audio podcast here...",
    "Medium articles? Turn them into professional podcasts here...",
    "Turn news articles into short audio bites...",
    "Looking to clone your voice? Start with a 30s recording...",
  ];
  const textPlaceholders = [
    "Not able to parse the URL? Try pasting the text here...",
    "Perfect for pasting text from PDFs, Word docs, Google Drive, etc...",
    "Be creative with what can be turned into a podcast...",
    "Paste in discussion from reddits, hackernews, product hunt etc...",
    "Paste in Twitter threads, group chats, etc...",
    // ... other potential placeholders ...
  ];
  const placeholders = activeTab === "url" ? urlPlaceholders : textPlaceholders;

  useEffect(() => {
    const app = initializeFirebaseApp();
    const storage = getStorage(app);
    const asyncOperations = AVAILABLE_VOICES.map(async (voice) => {
      voice.isPlaying = false;
      try {
        const url = `demo/voice_preview/${voice.name
          .split(" ")
          .join("")
          .toLowerCase()}.mp3`;
        const audioRef = ref(storage, url);
        const blob = await getBlob(audioRef);
        voice.audio = URL.createObjectURL(blob);
      } catch {}

      return voice;
    });

    Promise.all(asyncOperations).then(async (newVoiceLibrary) => {
      console.log(`added default voices, user voice id is ${props.userVoiceId}`)
      if (props.userVoiceId) {
        newVoiceLibrary = [
          {
            name: YOUR_OWN_VOICE,
            tags: [],
            audio: await getUserVoicePreviewAudio(userId),
          },
          ...newVoiceLibrary
        ];
      }
      setVoiceLibrary(newVoiceLibrary);
    });
  }, [props.userVoiceId]);

  useEffect(() => {
    if (voiceId) {
      getUserVoicePreviewAudio(userId).then((audio) => {
        let existYourOwnVoice = false;
        const newVoiceLibrary = voiceLibrary.map((voice) => {
          if (voice.name == YOUR_OWN_VOICE) {
            existYourOwnVoice = true;
            voice.audio = audio;
          }

          return voice;
        });

        setVoiceLibrary(
          existYourOwnVoice
            ? newVoiceLibrary
            : [
                {
                  name: YOUR_OWN_VOICE,
                  tags: [],
                  audio: audio,
                },
                ...newVoiceLibrary
              ]
        );
      });
    }
  }, [voiceId]);

  const wordCountCheck = async () => {
    props.setLoading(true);
    if (totalMinLength + props.totalUsedLength > props.totalAllowedLength) {
      setShowUpgradePlanAlert(true);
      props.setLoading(false);
      return;
    }

    var passWordCountCheck = false;
    if (totalMinLength < 10) {
      passWordCountCheck = true;
    }
    if (activeTab === "url") {
      const urls = extractUrls(props.inputContent);
      console.log(`extracted following urls: ${urls}`);
      if (urls && userId) {
        const app = initializeFirebaseApp()
        const auth = getAuth(app)
        const userIdToken = await auth.currentUser.getIdToken()
        const errorMessage = await checkWordCount(userIdToken, urls);
        console.log(errorMessage);
      }

      console.log(props.inputContent);
    } else {
      const wordCount = props.inputContent.trim().split(/\s+/).length;
      console.log("wordCount" + wordCount);
      if (wordCount > 650) {
        passWordCountCheck = true;
      }
    }
    if (passWordCountCheck || userAckWordCount) {
      // one time acknowledgement for word count
      setUserAckWordCount(false);
      console.log("calling onCreatePodcast in wordCountCheck");
      const response = await onCreatePodcast();
      if (response) {
        if (scriptOnly) {
          navigate(`/edit?contentId=${response.doc_ref}`);
        } else {
          navigate(`/result?contentId=${response.doc_id}`);
        }
      }
    } else {
      props.setLoading(false);
      setIsPopupOpen(true);
    }
  };

  useEffect(() => {
    console.log("entering useEffect userAckWordCount");
    if (userAckWordCount) {
      wordCountCheck();
    }
  }, [userAckWordCount]);

  useEffect(() => {
    setCurrentPlaceholder(0);
    setCurrentCharIndex(0);
    // Clear the timeouts if they exist.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    if (placeholders[currentPlaceholder]) {
      if (currentCharIndex < placeholders[currentPlaceholder].length) {
        timeoutRef.current = setTimeout(() => {
          setCurrentCharIndex((prevIndex) => prevIndex + 1);
        }, 10); // adjust timing as needed
      } else {
        timeoutRef.current = setTimeout(() => {
          setCurrentPlaceholder(
            (prevPlaceholder) => (prevPlaceholder + 1) % placeholders.length
          );
          setCurrentCharIndex(0);
        }, 3000);
      }
    }

    // This will clear the timeout when the component is unmounted or the effect is re-run.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentCharIndex, currentPlaceholder, activeTab]);

  const handleContentChange = (e) => {
    props.setInputContent(e.target.value);
    props.onChange();
  };

  const containsValidUrl = (urlText) => {
    const urls = extractUrls(urlText);
    return urls && urls.length > 0;
  };

  const extractUrls = (urlText) => {
    if (!urlText || urlText == "") {
      return false;
    }

    // Extract the URL from the input string using a regular expression
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = urlText.match(urlRegex);
    if (!matches) {
      return [];
    }
    return matches.map((match) => match.trim());
  };

  const onCreatePodcast = async () => {
    const voice_for_submission =
      selectedVoice === YOUR_OWN_VOICE
        ? voiceId
          ? voiceId
          : props.userVoiceId
        : selectedVoice;

    const app = initializeFirebaseApp()
    const auth = getAuth(app)
    const userIdToken = await auth.currentUser.getIdToken()
    if (activeTab === "url") {
      const urls = extractUrls(props.inputContent);
      console.log(`extracted following urls: ${urls}`);
      if (urls) {
        if (userId) {
          const inputParams = {
            contentUrls: urls,
            podcastTitle: podcastTitle,
            hostName: hostName,
            voiceId: voice_for_submission,
            totalLength: totalMaxLength,
            scriptOnly: scriptOnly,
            withMusic: backgroundMusicVolume && backgroundMusicVolume != 0 ? true : false,
            bgmVolume: backgroundMusicVolume,
            language: selectedLanguage
          };
          const response = await generatePodcast(
            userIdToken,
            userId,
            props.setLoading,
            inputParams
          );
          if (response === 'string') {
            props.setErrorMessage(response);
            return undefined
          } else {
            showNotificationTemporarily();
            props.setInputContent("");
            return response
          }
        } else {
          navigate("/login", {
            replace: true,
            state: {
              contentUrl: urls.join(","),
              podcastTitle: podcastTitle,
              hostName: hostName,
              voiceId: voice_for_submission,
              totalLength: totalMaxLength,
              scriptOnly: scriptOnly,
              withMusic: backgroundMusicVolume && backgroundMusicVolume != 0 ? true : false,
              bgmVolume: backgroundMusicVolume,
              language: selectedLanguage
            },
          });
        }
      }
    } else {
      if (userId) {
        const inputParams = {
          plainText: props.inputContent,
          podcastTitle: podcastTitle,
          hostName: hostName,
          voiceId: voice_for_submission,
          totalLength: totalMinLength,
          scriptOnly: scriptOnly,
          withMusic: backgroundMusicVolume && backgroundMusicVolume != 0 ? true : false,
          bgmVolume: backgroundMusicVolume,
          language: selectedLanguage
        };
        const response = await generatePodcast(
          userIdToken,
          userId,
          props.setLoading,
          inputParams
        );
        if (response === 'string') {
          props.setErrorMessage(response);
          return undefined
        } else {
          showNotificationTemporarily();
          props.setInputContent("");
          return response
        }
      } else {
        navigate("/login", {
          replace: true,
          state: {
            plainTextInput: props.inputContent,
            podcastTitle: podcastTitle,
            hostName: hostName,
            voiceId: voice_for_submission,
            totalLength: totalMinLength,
            scriptOnly: scriptOnly,
            withMusic: backgroundMusicVolume && backgroundMusicVolume != 0 ? true : false,
            bgmVolume: backgroundMusicVolume,
            language: selectedLanguage
          },
        });
      }
    }

    setUserAckWordCount(false);
  };

  const isButtonDisabled = () => {
    if (props.loading) {
      return true;
    }

    if (activeTab == "url") {
      return !containsValidUrl(props.inputContent);
    } else {
      return props.inputContent == null || props.inputContent == "";
    }
  };

  return (
    <div className="inputContainer">
      <Popup
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        popupTitle="Insufficient content provided"
        popupBody={
          "Attention: The content you provide does not meet your " +
          totalMinLength +
          "-minute podcast requirement, please either add more content or proceed with a shorter, lower-quality script."
        }
        cancelText="Add More Content"
        confirmText="Proceed Anyway"
        confirmAction={() => {
          setUserAckWordCount(true);
          setIsPopupOpen(false);
        }}
      ></Popup>

      <div className="content">
        <div className="tabContainer">
          <button
            className={activeTab === "url" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("url");
              setShowCreateFromUrlHelper(true);
              props.setInputContent("");
              amplitude.track("Settings Changed", {
                settingName: "Input content type",
                contentType: "URL",
              });
            }}
          >
            <p className="plainText">Create from URLs</p>
          </button>
          <button
            className={activeTab === "text" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("text");
              setShowCreateFromTextHelper(true);
              props.setInputContent("");
              amplitude.track("Settings Changed", {
                settingName: "Input content type",
                contentType: "Text",
              });
            }}
          >
            <p className="plainText">Create from text</p>
          </button>
        </div>

        {activeTab === "text" && showCreateFromTextHelper && (
          <CreateInfoHelper
            setShowHelper={setShowCreateFromTextHelper}
            column1={TEXT_DOS1}
            column2={TEXT_DOS2}
            column3={TEXT_DONTS}
          >
            <p className="helperText">
              <span style={{ fontWeight: "700" }}>PASTE</span> up to 6000 words.
              For best result, exclude ads, codes, legal disclaimers, and any
              irrelevant content.
            </p>
          </CreateInfoHelper>
        )}

        {activeTab === "url" && showCreateFromUrlHelper && (
          <CreateInfoHelper
            setShowHelper={setShowCreateFromUrlHelper}
            column1={URL_DOS1}
            column2={URL_DOS2}
            column3={URL_DONTS}
          >
            <p className="helperText">
              Optimized for newsletters, blogs, and articles. Auto-extract{" "}
              <span style={{ fontWeight: "700" }}>
                up to 25 URLs; each URL becomes a podcast paragraph.
              </span>
            </p>
          </CreateInfoHelper>
        )}

        <textarea
          placeholder={
            placeholders[currentPlaceholder]
              ? placeholders[currentPlaceholder].substring(0, currentCharIndex)
              : ""
          }
          value={props.inputContent}
          onChange={handleContentChange}
          className="urlInput"
        />

        {!isNaN(props.totalAllowedLength) && !isNaN(props.totalUsedLength) &&
          <div
            style={{
              marginBottom: "20px",
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "900px",
            }}
          >
            <p className="greyBoldText">
              Remaining quota: {Math.max(0, props.totalAllowedLength - props.totalUsedLength)} min
            </p>
          </div>
        }

        <GenerateAudioSettings
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          voiceLibrary={voiceLibrary}
          setVoiceLibrary={setVoiceLibrary}
          setVoiceId={setVoiceId}
          totalMinLength={totalMinLength}
          setTotalMinLength={setTotalMinLength}
          totalMaxLength={totalMaxLength}
          setTotalMaxLength={setTotalMaxLength}
          scriptOnly={scriptOnly}
          setScriptOnly={setScriptOnly}
          adContent={adContent}
          setAdContent={setAdContent}
          podcastTitle={podcastTitle}
          setPodcastTitle={setPodcastTitle}
          hostName={hostName}
          setHostName={setHostName}
          userId={userId}
          canEditAd={props.canEditAd}
          canCloneVoice={props.canCloneVoice}
          backgroundMusicVolume={backgroundMusicVolume}
          setBackgroundMusicVolume={setBackgroundMusicVolume}
          showNotificationTemporarily={showNotificationTemporarily}
        />
        {notification && (
          <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">Job successfully submitted!</h4>
            <p>
              You need to wait for another minute before submitting new jobs.
            </p>
          </div>
        )}

        <button
          className={
            !isButtonDisabled() ? "navigateButton" : "disabledNavigateButton"
          }
          onClick={() => {
            const type = scriptOnly ? 'script' : 'script & audio'
            amplitude.track("Button Clicked", {
              buttonName: "Generate " + type + " button",
              page: "Dashboard",
            });
            wordCountCheck();
          }}
          disabled={isButtonDisabled()}
        >
          <p className="plainText">{scriptOnly ? 'Generate script' : 'Generate script & audio'}</p>
        </button>
      </div>

      {showUpgradePlanAlert && (
        <UpgradePlanAlert
          userId={userId}
          closeModal={() => setShowUpgradePlanAlert(false)}
          from="Insufficient quota for the podcast length"
        />
      )}
    </div>
  );
};

export default DetailedUrlInput;
