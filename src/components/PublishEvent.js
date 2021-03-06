import React, { useState } from "react";
import PropTypes from "prop-types";
import uuid from "uuid";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { toSelectOption, toSelectOptions } from "../utils";
import { EventType } from "../types";
import { DEFAULT_TOPIC, DEFAULT_CONTEXT } from "../constants";

const EVENT_EVENT = "hub.event";
const EVENT_TOPIC = "hub.topic";

function PublishEvent({ isPublishAllowed, onPublishEvent }) {
  const [eventName, setEventName] = useState(EventType.OpenPatientChart);
  const [contextString, setContextString] = useState(
    JSON.stringify(DEFAULT_CONTEXT, null, 2)
  );
  const [contextError, setContextError] = useState();
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [previousId, setPreviousId] = useState();

  const validateContextJson = context => {
    try {
      const parsedContext = JSON.parse(context);
      const isArray = Array.isArray(parsedContext);
      const err = isArray ? null : "Context should be an array";
      setContextError(err);
      return isArray;
    } catch (e) {
      setContextError("Invalid JSON");
      return false;
    }
  };

  const handlePublishEvent = () => {
    if (!validateContextJson(contextString)) {
      return;
    }

    if (!onPublishEvent) {
      return;
    }

    const evt = {
      [EVENT_TOPIC]: topic,
      [EVENT_EVENT]: eventName,
      context: JSON.parse(contextString)
    };

    const id = uuid.v4();
    setPreviousId(id);
    onPublishEvent(evt, id);
  };

  const handleContextChange = e => {
    const value = e.target.value;
    setContextString(value);
    validateContextJson(value);
  };

  const isContextInvalid = Boolean(contextError);
  const contextValidClass = isContextInvalid ? "is-invalid" : "is-valid";
  const isPublishDisabled = !isPublishAllowed || isContextInvalid;
  const publishDisabledClass = isPublishDisabled ? "disabled" : "";
  return (
    <div className="fc-card">
      <div className="card">
        <h5 className="card-header">Publish event</h5>
        <div className="card-body">
          <form className="mb-1" onSubmit={e => e.preventDefault()}>
            <FormInput name="Topic" value={topic} onChange={setTopic} />
            <FormSelect
              name="Event"
              isMulti={false}
              options={toSelectOptions(Object.values(EventType))}
              value={toSelectOption(eventName)}
              onChange={option => setEventName(option.value)}
            />
            <label htmlFor="context-textarea">Context</label>
            <textarea
              className={`form-control ${contextValidClass}`}
              id="context-textarea"
              rows="6"
              value={contextString}
              onChange={handleContextChange}
            />
            {contextError ? (
              <div className="invalid-feedback">{contextError}</div>
            ) : (
              <small className="text-success">Valid JSON</small>
            )}
          </form>
          <div className="text-right">
            <button
              className={`btn btn-primary text-right ${publishDisabledClass}`}
              onClick={handlePublishEvent}
              disabled={isPublishDisabled}
            >
              Publish
            </button>
          </div>
        </div>
        <div className="card-footer">
          {previousId ? (
            <small className="text-success">
              Published event with ID <strong>{previousId}</strong>
            </small>
          ) : (
            <div>&nbsp;</div>
          )}
        </div>
      </div>
    </div>
  );
}

PublishEvent.propTypes = {
  isPublishAllowed: PropTypes.bool.isRequired,
  onPublishEvent: PropTypes.func.isRequired
};

export default PublishEvent;
