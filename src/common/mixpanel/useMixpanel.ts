import { useEffect } from 'react';
import { track, identify } from './mixpanel.config';
import { useInitMixpanel } from './useInitMixpanel';
import { useMyRoles } from '../../services/queries/rolesQueries';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api-request';

export const MIXPANEL_EVENTS = {
  PAGE_VIEW: 'Page View',
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  CUSTOMER_CREATED: 'Customer Created',
  CUSTOMER_UPDATED: 'Customer Updated',
  TASK_CREATED: 'Task Created',
  TASK_UPDATED: 'Task Updated',
  INSIGHT_VIEWED: 'Insight Viewed',
  INSIGHT_ACTION: 'Insight Action',
  INSIGHT_COMMENT: 'Insight Comment',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  EMAIL_SENT: 'Email Sent',
  INSIGHT_FILTER_CHANGED: 'Insight Filter Changed',
  ASK_AI_INTERACTION: 'AskAI Interaction',
  UPLOAD_TRANSCRIPT: 'Upload Transcript',
  CREATE_CHECKLIST: 'Create Checklist',
  UPDATE_CHECKLIST: 'Update Checklist',
  GUIDANCE_ACTION: 'Guidance Action',
};

export const useMixpanel = () => {
  const isInitialized = useInitMixpanel();
  const roles = useMyRoles();
  
  // Get detailed user info
  const { data: userInfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=false',
      }),
    enabled: !!roles.data?.data?.roles, // Only fetch when roles are available
    refetchOnWindowFocus: false,
  });

  const getUserContext = () => {
    if (!roles.data?.data) return {};
    
    // Get user details from roles and userInfo
    const userId = roles.data.data.id;
    const userDetails = userInfo?.data;
    // Only include minimal required user information
    return {
      user_id: userId,
      user_name: userDetails
        ? `${userDetails.first_name || ''} ${
            userDetails.last_name || ''
          }`.trim()
        : '',
      org_id: localStorage.getItem('org_id'),
      ic_instance_name: userDetails ? userDetails?.ic_instance_name ?? '' : '',
      email_domain: userDetails?.email_domain ?? '',
      // Commented out sensitive/unnecessary fields
      // user_email: userDetails?.email || roles.data.data.email,
      // hashemail: userDetails?.hashemail,
      // user_roles: roles.data.data.roles,
      // is_admin: roles.data.data.roles?.includes('admin'),
      // user_status: roles.data.data.user_status,
      environment: process.env.NODE_ENV,
    };
  };

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!isInitialized) {
      console.log('Mixpanel not initialized yet, queuing event:', eventName);
      return;
    }

    // Add minimal context and common properties to every event
    const commonProperties = {
      timestamp: new Date().toISOString(),
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      ...getUserContext(),
      ...properties
    };

    track(eventName, commonProperties);
  };

  const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
    if (!isInitialized) {
      console.log('Mixpanel not initialized yet, queuing identify:', userId);
      return;
    }

    const userContext = getUserContext();
    const enhancedProperties = {
      ...userProperties,
      $name: userContext.user_name,
      // Commented out sensitive fields from identify call
      // $email: userContext.user_email,
      // hashemail: userContext.hashemail,
      // roles: userContext.user_roles,
      org_id: userContext.org_id,
      // user_status: userContext.user_status,
      $last_seen: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };

    identify(userId, enhancedProperties);
  };

  return {
    trackEvent,
    identifyUser,
    MIXPANEL_EVENTS,
    isInitialized
  };
};