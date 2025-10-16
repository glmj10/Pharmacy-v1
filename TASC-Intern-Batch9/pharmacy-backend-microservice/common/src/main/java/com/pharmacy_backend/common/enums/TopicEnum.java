package com.pharmacy_backend.common.enums;


import lombok.Getter;

@Getter
public enum TopicEnum {
    USER_TOPIC,
    PROFILE_TOPIC;

    public String getName() {
        return this.name();
    }
}
