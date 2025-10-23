import RPi.GPIO as GPIO
import time

RELAY_PIN = 17
GPIO.setmode (GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)

ON = GPIO.HIGH
OFF = GPIO.LOW

try:
    while True:
        GPIO. output (RELAY_PIN, ON)
        time.sleep(2)
        GPIO.output(RELAY_PIN, OFF)
        time.sleep(3)
except KeyboardInterrupt:
    GPIO.cleanup()