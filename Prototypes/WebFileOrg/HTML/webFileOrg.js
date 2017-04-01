function dBPress() {
  x = document.getElementById("inputAmount").value;
  document.getElementById("hej").innerHTML = "Displaying " + x + " fake files.";

  var ul = document.getElementById("fileList");
  ul.innerHTML = '';

  for(i = 0; i < x; i++) {
    var a = document.createElement("a");
    var li = document.createElement("li");
    li.innerHTML = "";
    a.innerHTML = "FakeFile.txt";
    a.href = "https://www.google.se/?gfe_rd=cr&ei=jCzBWP23IYXFsAH97Ky4BQ"

    li.appendChild(a);
    ul.appendChild(li);
  }
}
