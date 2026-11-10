class Capture extends AudioWorkletProcessor {
  constructor(){
    super();
    this.chunk=new Float32Array(2048);
    this.used=0;
    this.port.onmessage=()=>{
      if(this.used)this.port.postMessage(this.chunk.slice(0,this.used));
      this.port.postMessage(null);
      this.done=true;
    };
  }
  process(inputs){
    if(this.done)return false;
    const samples=inputs[0][0];
    if(samples){
      for(const sample of samples){
        this.chunk[this.used++]=sample;
        if(this.used===this.chunk.length){
          this.port.postMessage(this.chunk,[this.chunk.buffer]);
          this.chunk=new Float32Array(2048);
          this.used=0;
        }
      }
    }
    return true;
  }
}
registerProcessor('raffah-capture',Capture);

