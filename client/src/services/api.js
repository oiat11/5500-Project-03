import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const donorApi = {
  // 获取所有捐赠者
  getAllDonors: () => api.get('/donor'),
  
  // 获取单个捐赠者详情
  getDonorById: (id) => api.get(`/donor/${id}`),
  
  // 创建捐赠者
  createDonor: (data) => api.post('/donor', data),
  
  // 更新捐赠者
  updateDonor: (id, data) => api.put(`/donor/${id}`, data),
  
  // 删除捐赠者
  deleteDonor: (id) => api.delete(`/donor/${id}`),
  
  // 推荐捐赠者
  getRecommendedDonors: () => api.get('/donor/recommend')
};

export const tagApi = {
  // 获取所有标签
  getAllTags: () => api.get('/tag'),
  
  // 创建标签
  createTag: (data) => api.post('/tag', data),
  
  // 更新标签
  updateTag: (id, data) => api.patch(`/tag/${id}`, data),
  
  // 删除标签
  deleteTag: (id) => api.delete(`/tag/${id}`)
};

export default api; 