/**
 * Copyright 2012 Nikita Koksharov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.corundumstudio.socketio.parser;

import io.netty.util.CharsetUtil;

import java.util.Collections;
import java.util.List;

public class Packet {

    public static final char DELIMITER = '\ufffd';
    public static final byte[] DELIMITER_BYTES = new String(new char[] {DELIMITER}).getBytes(CharsetUtil.UTF_8);
    public static final byte SEPARATOR = ':';

    public static final String ACK_DATA = "data";

    public static final Packet NULL_INSTANCE = new Packet(null);

    private final PacketType type;
    private List<?> args = Collections.emptyList();
    private String qs;
    private Object ack;
    private Long ackId;
    private String name;
    private Long id;
    private String endpoint;
    private Object data;

    private ErrorReason reason;
    private ErrorAdvice advice;

    public Packet(PacketType type) {
        super();
        this.type = type;
    }

    public PacketType getType() {
        return type;
    }

    public void setData(Object data) {
        this.data = data;
    }

    /**
     * Get packet data
     * <pre>
     * @return <b>json object</b> for {@link PacketType.JSON} type
     * <b>message</b> for {@link PacketType.MESSAGE} type
     * </pre>
     */
    public Object getData() {
        return data;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public void setAck(Object ack) {
        this.ack = ack;
    }

    public Object getAck() {
        return ack;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<?> getArgs() {
        return args;
    }

    public void setArgs(List<?> args) {
        this.args = args;
    }

    public String getQs() {
        return qs;
    }

    public void setQs(String qs) {
        this.qs = qs;
    }

    public Long getAckId() {
        return ackId;
    }

    public void setAckId(Long ackId) {
        this.ackId = ackId;
    }

    public ErrorReason getReason() {
        return reason;
    }

    public void setReason(ErrorReason reason) {
        this.reason = reason;
    }

    public ErrorAdvice getAdvice() {
        return advice;
    }

    public void setAdvice(ErrorAdvice advice) {
        this.advice = advice;
    }

    private boolean isJsonAck() {
        return (Boolean.TRUE.equals(getAck()) || ACK_DATA.equals(getAck())) && getType().equals(PacketType.JSON);
    }

    private boolean isEventAck() {
        return ACK_DATA.equals(getAck()) && getType().equals(PacketType.EVENT);
    }

    public boolean isAck() {
        return getId() != null && (isEventAck() || isJsonAck());
    }

}
