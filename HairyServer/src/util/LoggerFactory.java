package util;

public class LoggerFactory {
  private static LoggerFactory _instance = new LoggerFactory();
  public static LoggerFactory getLogger() { return _instance; }
  
  public boolean enableTrace = true;
  public boolean enableDebug = true;
  public boolean enableInfo = true;
  public boolean enableWarn = true;
  public boolean enableError = true;
  
  public static LoggerFactory getLogger(Class<?> c) {
    return _instance;
  }
  
  public boolean isTraceEnabled() {
    return enableTrace;
  }
  
  public boolean isDebugEnabled() {
    return enableDebug;
  }
  
  public void trace(String format, Object... args) {
    if(!enableTrace) return;
    for(Object arg : args) { format = format.replaceFirst("\\{\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void debug(String format, Object... args) {
    if(!enableDebug) return;
    for(Object arg : args) { format = format.replaceFirst("\\{\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void info(String format, Object... args) {
    if(!enableInfo) return;
    for(Object arg : args) { format = format.replaceFirst("\\{\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void warn(String format, Object... args) {
    if(!enableWarn) return;
    for(Object arg : args) { format = format.replaceFirst("\\{\\}", arg.toString()); }
    System.err.println(format);
  }
  
  public void error(String format, Object... args) {
    if(!enableError) return;
    for(Object arg : args) { format = format.replaceFirst("\\{\\}", arg.toString()); }
    System.err.println(format);
  }
}