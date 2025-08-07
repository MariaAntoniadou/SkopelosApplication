export const SERVER_IP = 'https://skopelos-admin.inculture.app/api';
export const UPLOADS_BASE_URL = 'https://skopelos-admin.inculture.app';


const withLocale = (url, locale = 'el') =>
  `${url}${url.includes('?') ? '&' : '?'}locale=${locale}`;


export const ENDPOINTS = {

  getIntroductionChaptersDeep: (locale = 'el') =>
  `/introduction-chapters?locale=${locale}&populate[0]=storyboards,thumbnail&populate[1]=storyboards.thumbnail,storyboards.slides&populate[2]=storyboards.slides.medias&populate[3]=storyboards.slides.medias.files,storyboards.slides.medias.thumbnail,storyboards.slides.medias.tags&populate[4]=storyboards.slides.medias.tags.svg`,

    
  getAllMainChapters: (locale = 'el') =>
    withLocale(
      `/main-chapters?populate[0]=mainStoryboards&populate[1]=mainStoryboards.thumbnail,mainStoryboards.tags`,
      locale
    ),

  getChapterById: (id) => `/main-chapters/${id}`,


  getPointById:(id) => `/points/${id}?populate[0]=thumbnail,medias,tags&populate[1]=medias.thumbnail,medias.files,tags.svg`,


  getEventsDeep: (locale = 'el') =>
    withLocale(
      `/events?populate[0]=thumbnail,date,points&populate[1]=points.thumbnail,points.medias,points.tags&populate[2]=points.medias.thumbnail,points.tags.svg`,
      locale
    ),

    

  getTrailById: (id, locale = 'el') =>
  withLocale(`/trails/${id}?populate[0]=points&populate[1]=gpx`, locale),


};


