// src/features/hub/sharedProfile/videoEdit/VideoEditDrawerBody.js

import React from 'react'

import VideoEditFields from '../../../../ui/forms/videos/VideoEditFields.js'

export default function VideoEditDrawerBody(props) {
  return <VideoEditFields {...props} onDraft={props.setDraft} />
}
