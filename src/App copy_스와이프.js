import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import AddRounded from '@mui/icons-material/AddRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import Chip from '@mui/material/Chip';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';




function App() {
  const [message, setMessage] = useState(''); // 현재 입력 필드에 입력된 메시지
  const [messages, setMessages] = useState(() => {
    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : {};
  });
  const [inputHeight, setInputHeight] = useState(45); // 초기 높이를 56px로 설정
  const maxInputHeight = 400; // 최대 높이 설정
  const messagesEndRef = useRef(null);  // 메시지 자동이동
  const [dates, setDates] = useState(() => {
    // 로컬 스토리지에서 날짜 불러오기
    const savedDates = localStorage.getItem('dates');
    return savedDates ? JSON.parse(savedDates) : [];
  });
  const [selectedDate, setSelectedDate] = useState(''); // 선택된 날짜
  const messageRefs = useRef({}); // 메시지 위치 참조를 위한 객체

  // diaryTitle 상태 초기화, 로컬 스토리지에서 불러오거나 기본값 사용
  const [diaryTitle, setDiaryTitle] = useState(() => localStorage.getItem('diaryTitle') || '나의 일상');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(diaryTitle);
  const textAreaRef = useRef(null);


  

  useEffect(() => {
    // 제목이 변경될 때마다 로컬 스토리지에 저장
    localStorage.setItem('김도아님의 일기', diaryTitle);
  }, [diaryTitle]);

  useEffect(() => {
    // 메시지 또는 날짜가 변경될 때마다 로컬 스토리지에 저장
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('dates', JSON.stringify(dates));
  }, [messages, dates]);

  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (event) => {
    setTempTitle(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setDiaryTitle(tempTitle);
      setEditingTitle(false);
    }
  };

  const handleBlur = () => {
    setDiaryTitle(tempTitle);
    setEditingTitle(false);
  };




  
  useEffect(() => {
    if (selectedDate) {
      messageRefs.current[selectedDate]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // 메시지 배열이 변경될 때 스크롤

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 현재 날짜를 포맷팅하는 함수
  const formatDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString()
    };
  };

  // 메시지 입력 시 호출되는 함수
  const handleMessageChange = (event) => {
    setMessage(event.target.value); // 입력값을 `message` 상태로 업데이트
    adjustHeight();
  };

  // 입력 필드의 높이를 조정하는 함수
  const adjustHeight = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    textArea.style.height = '43px'; // 높이를 auto로 재설정
    textArea.style.height = `${Math.max(textArea.scrollHeight, 43)}px`; // 최소 높이를 40px로 설정
  };
  //위 코드와 연계
  useEffect(() => {
    adjustHeight(); // 메시지가 변경될 때마다 높이 조정
  }, [message]);

  // 작성 버튼 클릭 시 호출되는 함수
  const handleSubmit = () => {
    if (!message.trim()) return;
    const { date, time } = formatDateTime();
    const isNewDay = !messages[date];
    setMessages(prevMessages => ({
      ...prevMessages,
      [date]: [...(prevMessages[date] || []), { text: message, time, isNewDay }]
    }));

    setMessage('');
    setInputHeight(40); // 입력창 높이 기본값으로 재설정
    adjustHeight(); // 입력창 높이를 조정하는 함수를 호출하여 `<textarea>`의 높이를 초기화
  
  
    // 날짜 목록에 현재 날짜가 없으면 추가
    if (!dates.includes(date)) {
      setDates([...dates, date]);
    }
    if (isNewDay) {
      setSelectedDate(date);
    }
  };



   //선택된 날짜 기능
   const handleDateSelection = (date) => {
    setSelectedDate(date);
    const element = messageRefs.current[date];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  

  // 텍스트에 따라 입력창의 높이를 업데이트하는 함수
  const updateInputHeight = (text) => {
    if (!text) {
      setInputHeight(45); // 텍스트가 없을 경우 기본 높이로 설정
      return;
    }
    const numberOfLineBreaks = (text.match(/\n/g) || []).length;
    const newHeight = Math.min(56 + numberOfLineBreaks * 20, maxInputHeight); // 최대 높이를 넘지 않도록 조정
    setInputHeight(newHeight); // 새 높이 설정
  };


  // 메시지가 렌더링될 때 각 일자의 첫 메시지에 참조를 설정
  const chatMessages = Object.entries(messages).map(([date, msgs]) => (
    msgs.map((msg, index) => (
      <React.Fragment key={index}>
        {msg.isNewDay && <div className="date-display" ref={el => messageRefs.current[date] = el}>{date}</div>}
        <div className="message-box">
          {msg.text}
          <div className="time-tag">{msg.time}</div>  // 시간 태그 추가
        </div>
      </React.Fragment>
    ))
  ));

    // 메뉴의 상태를 관리하는 useState 훅을 사용합니다.
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    // 메뉴를 열고 닫는 함수를 정의합니다.
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

















//  *************************************************************************************   


  
  return (
    <div className="App">
      <header className="App-header">
        
        <div className="mainHeader">
          <div className='mainTitle'><Avatar alt="AI" sx={{ width: 45, height: 45 }} src="https://www.kocca.kr/n_content/vol21/img/s14/img_1.jpg" />&nbsp;&nbsp;&nbsp; {editingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={handleTitleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <h2 onClick={handleTitleClick}>{diaryTitle}</h2>
          )}
          
          </div>
          
          {/* 날짜선택 코드 */}
            <div className='selectDateDiv'>
                      {/* Swiper 구성 요소로 날짜 선택 부분 교체 */}
        <Swiper
          slidesPerView={3}
          spaceBetween={5}
          pagination={{ clickable: true }}
          className="mySwiper">

              {dates.map(date => (
                <SwiperSlide key={date}>
                  <Chip label={date} style={{ fontSize: 'smaller', marginLeft: '5px' }} variant="outlined" size="small" key={date} onClick={() => handleDateSelection(date)}>
                    {date}
                  </Chip>  </SwiperSlide>   )
                  
                //  아래는 버튼 형식이 더 나을지 Chip형식이 더 나을지 고민해봐야함  
                //   <button className="selectDateButton" key={date} onClick={() => handleDateSelection(date)}>
                //   {date}
                // </button>   


                )}
                </Swiper>
            </div>
          
          
          </div>
        </header>
        <div className='temp'></div>
        
        







  {/* //  ************************************************************************************* */}


        

        

          


      
    <Swiper 
        slidesPerView={1} // 한 번에 하나의 슬라이드만 보이도록 설정
        spaceBetween={5}
        loop={false} // 슬라이더를 루프로 설정
        pagination={{ clickable: false }}
        className="bodyDiv2" >
        

      <SwiperSlide className="bodyDiv3">

      <div className='bodyDiv'>

        <div className="chat-messages" id="chat-messages" >
          {Object.entries(messages).map(([date, msgs]) => (
            msgs.map((msg, index) => (
              <React.Fragment key={index}>
                {msg.isNewDay && (
                  <div className="date-display" ref={el => messageRefs.current[date] = el}>{date} : 오늘의 첫 일기 <Divider /></div>
                )}
                <div className="message-box">
                  {msg.text}                  
                </div>
                <div className="date-tag">{msg.time}</div>
              </React.Fragment>
            ))
          ))}
            <div ref={messagesEndRef} />
        </div>
      </div>




      
  








  {/* //  ************************************************************************************* */}






        
        <div className='chat_input_container'>

            <div className='chat_icon_box'>
            <AddRounded onClick={scrollToBottom} fontSize='large'/>
            </div>
 

            <div className="chat-input" >
              
              <textarea
                  ref={textAreaRef}
                  multiline="true" // "true"는 문자열이어야 합니다.
                  maxRows={10}
                  className={`textChat ${message ? 'expanded' : ''}`} // 'text' 대신 'message' 사용
                  placeholder="지금 이순간...."
                  value={message}
                  onChange={handleMessageChange} // 직접적인 핸들러 참조
                  onFocus={() => setMessage(message + '')} // 'text' 대신 'message' 사용
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) { // Shift+Enter를 누를 때 줄바꿈 허용
                      event.preventDefault();
                      const newMessage = message + "\n";
                      setMessage(newMessage);
                    }
                  }}
                  />    

              
            </div>
            <div className='chat_icon_box_right'>
                    <button onClick={handleSubmit}>
                  <CreateRoundedIcon color='primary'/>
                  </button>
            </div>

        </div>

    </SwiperSlide>
      




























    <SwiperSlide className='slide2'>
    <Divider/>
    <div className='slide2_div' >
    
      <div>
      <Card sx={{ maxWidth: 300 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image="https://dimg.donga.com/wps/NEWS/IMAGE/2022/09/06/115340279.2.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            2024-04-24
          </Typography>
          <Typography className='Typography' variant="body2" color="text.secondary" >
          봄날의 햇살이 부드럽게 방 안을 비추는 아침이다. 
     

          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    </div>
    <div className='slide2_div_div2'>
    <Card sx={{ maxWidth: 300 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image="https://image.ajunews.com/content/image/2021/06/14/20210614175000838268.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            2024-04-23
          </Typography>
          <Typography variant="body2" color="text.secondary">
            오늘은 날씨가 흐렸고... 비가 왔다... 그렇지만 나는 비를 뚫고 해낼것이다!
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    </div>








    </div>
    </SwiperSlide>


      
  </Swiper>
























    </div>
  );
}

export default App;
