  
import React from 'react';
import { AgentType } from '../../app/api/agents/agent-types';

interface AgentsIconProps {
  type: AgentType.DOCUMENT | AgentType.NEWS | AgentType.EMAIL | AgentType.SERVICE_TICKET;
  size?: 'small' | 'large';
}

const AgentIcon: React.FC<AgentsIconProps> = ({ type, size = 'large' }) => {
    const imageClass = size === 'small' 
      ? 'w-[130px] h-[107px] rounded-[16px] opacity-100 object-cover'
      : 'w-[204px] h-[137px] rounded-[10px] opacity-100 object-cover';
    
    const containerClass = size === 'small' 
      ? 'flex items-center justify-center'
      : 'w-full flex items-center justify-center mb-4';

    switch (type) {
      case 'document':
        return (
          <div className={containerClass}>
            <img 
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764666736/01f9f44ff2dd706d3445d608df2ca69cff0cd137_yl8dd7_eecb46.png" 
              alt="Document Agent"
              className={imageClass}
            />
          </div>
        );
      case 'news':
        return (
          <div className={containerClass}>
            <img 
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764666988/01f9f44ff2dd706d3445d608df2ca69cff0cd137_yl8dd7_b0554e.png" 
              alt="News Agent"
              className={imageClass}
            />
          </div>
        );
      case 'email':
        return (
          <div className={containerClass}>
            <img 
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764666894/01f9f44ff2dd706d3445d608df2ca69cff0cd137_yl8dd7_79abbb.png" 
              alt="Email Agent"
              className={imageClass}
            />
          </div>
        );
      case 'service_ticket':
        return (
          <div className={containerClass}>
            <img 
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764666894/01f9f44ff2dd706d3445d608df2ca69cff0cd137_yl8dd7_79abbb.png" 
              alt="Service Ticket Agent"
              className={imageClass}
            />
          </div>
        );
      default:
        return null;
    }
  };

  export default AgentIcon;