
    function asciiDecode(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    function readUint16LE(buffer) {
        var view = new DataView(buffer);
        var val = view.getUint8(0);
        val |= view.getUint8(1) << 8;
        return val;
    }

    function fromArrayBuffer(buf, offsetPos) {
      // Check the magic number
      let pos = offsetPos
      if (/*new Uint8Array(buf.slice(pos, pos + 1))[0] != 0x93 || */asciiDecode(buf.slice(pos+1, pos+6)) != 'NUMPY') {
          throw new Error('unknown file type');
      }

      var version = new Uint8Array(buf.slice(pos + 6, pos + 8)),
          headerLength = readUint16LE(buf.slice(pos + 8, pos + 10)),
          headerStr = asciiDecode(buf.slice(pos + 10, pos + 10 + headerLength));
          offsetBytes = pos + 10 + headerLength;
  
          //rest = buf.slice(10 + headerLength); //  XXX -- This makes a copy!!! https://www.khronos.org/registry/typedarray/specs/latest/#5
          //console.log(rest)

      // Hacky conversion of dict literal string to JS Object
      eval("var info = " + headerStr.toLowerCase().replace('(','[').replace('),',']'));
      //console.log(info);
      // Intepret the bytes according to the specified dtype
      let numEl = info.shape.reduce((a,b) => a*b, 1)
      var data;
      if (info.descr === "|u1") {
          data = new Uint8Array(buf, offsetBytes);
      } else if (info.descr === "|i1") {
          data = new Int8Array(buf, offsetBytes);
      } else if (info.descr === "<u2") {
          data = new Uint16Array(buf, offsetBytes);
      } else if (info.descr === "<i2") {
          data = new Int16Array(buf, offsetBytes);
      } else if (info.descr === "<u4") {
          data = new Uint32Array(buf, offsetBytes);
      } else if (info.descr === "<i4") {
          data = new Int32Array(buf, offsetBytes);
      } else if (info.descr === "<f4") {
          data = new Float32Array(buf.slice(offsetBytes, offsetBytes + numEl * 4));
      } else if (info.descr === "<f8") {
          data = new Float64Array(buf, offsetBytes);
      } else {
          throw new Error('unknown numeric dtype')
      }

      return {
          shape: info.shape,
          fortran_order: info.fortran_order,
          data: data
      };
    }

